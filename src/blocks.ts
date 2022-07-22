import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import {
    Block,
    BlockKinds,
    Const,
    Export,
    Function,
    Module,
    TypedBlock,
    UnparsedBlock,
} from "./types";
import { isTestFile } from "./utils";

export function blockKind(block: string): Result<string, BlockKinds> {
    if (block.startsWith("--")) {
        return Ok("Comment");
    }

    if (block.startsWith("{-")) {
        return Ok("MultilineComment");
    }

    if (block.startsWith("type alias")) {
        return Ok("TypeAlias");
    }

    if (block.startsWith("type ")) {
        return Ok("UnionType");
    }

    if (block.startsWith(" ") || block.startsWith("}")) {
        return Ok("Indent");
    }

    if (block.startsWith("import")) {
        return Ok("Import");
    }

    if (block.startsWith("exposing")) {
        return Ok("Export");
    }

    const hasTypeLine =
        block.split(":").length > 1 &&
        block.split(":")[0].trim().split(" ").length === 1;
    const isAFunction = block.split("\n")[0].split("->").length > 1;

    if (hasTypeLine) {
        if (isAFunction) {
            return Ok("Function");
        } else {
            return Ok("Const");
        }
    }

    if (block.split("=").length > 1) {
        return Ok("Definition");
    }

    return Err("Unknown block type");
}

function createUnparsedBlock(
    blockKind: BlockKinds,
    lineStart: number,
    lines: string[]
): UnparsedBlock {
    switch (blockKind) {
        case "Import": {
            return UnparsedBlock("ImportBlock", lineStart, lines);
        }

        case "Export": {
            return UnparsedBlock("ExportBlock", lineStart, lines);
        }

        case "Const": {
            return UnparsedBlock("ConstBlock", lineStart, lines);
        }

        case "Function": {
            return UnparsedBlock("FunctionBlock", lineStart, lines);
        }

        case "UnionType": {
            return UnparsedBlock("UnionTypeBlock", lineStart, lines);
        }

        case "TypeAlias": {
            return UnparsedBlock("TypeAliasBlock", lineStart, lines);
        }

        case "Indent": {
            return UnparsedBlock("UnknownBlock", lineStart, lines);
        }

        case "Definition": {
            return UnparsedBlock("UnknownBlock", lineStart, lines);
        }

        case "Comment": {
            return UnparsedBlock("CommentBlock", lineStart, lines);
        }

        case "MultilineComment": {
            return UnparsedBlock("MultilineCommentBlock", lineStart, lines);
        }

        case "Unknown": {
            return UnparsedBlock("UnknownBlock", lineStart, lines);
        }
    }
}

export function intoBlocks(body: string): UnparsedBlock[] {
    const blocks: UnparsedBlock[] = [ ];

    const lines = body.split("\n");

    let currentBlockKind: Result<string, BlockKinds> = Err("Nothing");
    let currentBlock: string[] = [ ];
    let lineStart = 0;

    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().length === 0) continue;

        if (currentBlock.length === 0) {
            // when we don't have anything on the current block, we deduce the kind,
            // then push the line onto the current block
            currentBlockKind = blockKind(line);
            lineStart = i;
            currentBlock.push(line);
        } else {
            if (
                currentBlockKind.kind === "Ok" &&
                currentBlockKind.value === "MultilineComment"
            ) {
                if (line === "-}") {
                    currentBlock.push(line);
                    blocks.push(
                        createUnparsedBlock(
                            currentBlockKind.value,
                            lineStart,
                            currentBlock
                        )
                    );
                    currentBlock = [ ];
                } else {
                    currentBlock.push(line);
                }
                continue;
            }
            const currentLineBlockKind = blockKind(line);

            const isIndent =
                currentLineBlockKind.kind === "Ok" &&
                currentLineBlockKind.value === "Indent";
            const isDefinition =
                currentLineBlockKind.kind === "Ok" &&
                currentLineBlockKind.value === "Definition";

            if (isIndent || isDefinition) {
                // an indent, when indented we push the current block
                if (i > 0 && lines[i - 1].trim() === "") {
                    currentBlock.push(lines[i - 1]);
                }
                currentBlock.push(line);
            } else {
                switch (currentBlockKind.kind) {
                    case "Ok": {
                        blocks.push(
                            createUnparsedBlock(
                                currentBlockKind.value,
                                lineStart,
                                currentBlock
                            )
                        );
                        currentBlockKind = currentLineBlockKind;
                        currentBlock = [ ];
                        currentBlock.push(line);
                        lineStart = i;
                        break;
                    }
                    case "Err": {
                        // when we don't know the current block
                        currentBlock.push(line);
                        break;
                    }
                }
            }
        }
    }

    if (currentBlock.length > 0) {
        switch (currentBlockKind.kind) {
            case "Ok": {
                blocks.push(
                    createUnparsedBlock(
                        currentBlockKind.value,
                        lineStart,
                        currentBlock
                    )
                );
                break;
            }
            case "Err": {
                blocks.push(
                    createUnparsedBlock("Unknown", lineStart, currentBlock)
                );
                break;
            }
        }
    }

    return blocks;
}

export function typeBlocks(blocks: Block[]): TypedBlock[] {
    return blocks.filter(
        (block: Block) =>
            block.kind === "UnionType" || block.kind === "TypeAlias"
    ) as TypedBlock[];
}

export function exportTests(module: Module): Export {
    const isTest = isTestFile(module.name);
    const namesToExpose = isTest
        ? module.body
              .filter((block) => {
                  return block.kind === "Function" || block.kind === "Const";
              })
              .map((block) => (block as Function | Const).name)
              .filter((name) => name.startsWith("test"))
        : [ ];

    const exports = module.body.filter(
        (block) => block.kind === "Export"
    ) as Export[];

    const exposeWithoutDuplicates = namesToExpose.filter((name) => {
        for (const export_ of exports) {
            if (export_.names.includes(name)) {
                return false;
            }
        }
        return true;
    });

    return Export(exposeWithoutDuplicates);
}
