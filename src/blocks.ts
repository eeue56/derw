import {
    Just,
    map,
    Maybe,
    Nothing,
    withDefault,
} from "@eeue56/ts-core/build/main/lib/maybe";
import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { BlockKinds, UnparsedBlock } from "./types";

export function blockKind(block: string): Result<string, BlockKinds> {
    if (block.startsWith("type")) {
        return Ok("UnionType");
    }

    if (block.startsWith(" ")) {
        return Ok("Indent");
    }

    const hasTypeLine = block.split(":").length > 1;
    const isAFunction = block.split("->").length > 1;

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
        case "Const": {
            return UnparsedBlock("ConstBlock", lineStart, lines);
        }

        case "Function": {
            return UnparsedBlock("FunctionBlock", lineStart, lines);
        }

        case "UnionType": {
            return UnparsedBlock("TypeBlock", lineStart, lines);
        }

        case "Indent": {
            return UnparsedBlock("UnknownBlock", lineStart, lines);
        }

        case "Definition": {
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
            const currentLineBlockKind = blockKind(line);

            const isIndent =
                currentLineBlockKind.kind === "ok" &&
                currentLineBlockKind.value === "Indent";
            const isDefinition =
                currentLineBlockKind.kind === "ok" &&
                currentLineBlockKind.value === "Definition";

            if (isIndent || isDefinition) {
                // an indent, when indented we push the current block
                currentBlock.push(line);
            } else {
                switch (currentBlockKind.kind) {
                    case "ok": {
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
                    case "err": {
                        // when we don't know the current block
                        currentBlock.push(line);
                        break;
                    }
                }
            }
        }
    }

    if (currentBlock.length > 0) {
        blocks.push(
            createUnparsedBlock(
                (currentBlockKind as Ok<BlockKinds>).value,
                lineStart,
                currentBlock
            )
        );
    }

    return blocks;
}
