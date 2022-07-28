import * as List from "./stdlib/List";

import { BlockKinds, Block, TypedBlock, Module } from "./types";

import { isTestFile } from "./utils";

export { blockKind };
export { createUnparsedBlock };
export { intoBlocks };
export { typeBlocks };
export { exportTests };

type Validator = {
    test: (arg0: string) => boolean;
    blockKind: BlockKinds;
}

function Validator(args: { test: (arg0: string) => boolean, blockKind: BlockKinds }): Validator {
    return {
        ...args,
    };
}

type Ok<value> = {
    kind: "Ok";
    value: value;
};

function Ok<value>(args: { value: value }): Ok<value> {
    return {
        kind: "Ok",
        ...args,
    };
}

type Err<error> = {
    kind: "Err";
    error: error;
};

function Err<error>(args: { error: error }): Err<error> {
    return {
        kind: "Err",
        ...args,
    };
}

type Result<error, value> = Ok<value> | Err<error>;

type ImportBlock = {
    kind: "ImportBlock";
    lineStart: number;
    lines: string[];
};

function ImportBlock(args: { lineStart: number, lines: string[] }): ImportBlock {
    return {
        kind: "ImportBlock",
        ...args,
    };
}

type ExportBlock = {
    kind: "ExportBlock";
    lineStart: number;
    lines: string[];
};

function ExportBlock(args: { lineStart: number, lines: string[] }): ExportBlock {
    return {
        kind: "ExportBlock",
        ...args,
    };
}

type UnionTypeBlock = {
    kind: "UnionTypeBlock";
    lineStart: number;
    lines: string[];
};

function UnionTypeBlock(args: { lineStart: number, lines: string[] }): UnionTypeBlock {
    return {
        kind: "UnionTypeBlock",
        ...args,
    };
}

type TypeAliasBlock = {
    kind: "TypeAliasBlock";
    lineStart: number;
    lines: string[];
};

function TypeAliasBlock(args: { lineStart: number, lines: string[] }): TypeAliasBlock {
    return {
        kind: "TypeAliasBlock",
        ...args,
    };
}

type FunctionBlock = {
    kind: "FunctionBlock";
    lineStart: number;
    lines: string[];
};

function FunctionBlock(args: { lineStart: number, lines: string[] }): FunctionBlock {
    return {
        kind: "FunctionBlock",
        ...args,
    };
}

type ConstBlock = {
    kind: "ConstBlock";
    lineStart: number;
    lines: string[];
};

function ConstBlock(args: { lineStart: number, lines: string[] }): ConstBlock {
    return {
        kind: "ConstBlock",
        ...args,
    };
}

type CommentBlock = {
    kind: "CommentBlock";
    lineStart: number;
    lines: string[];
};

function CommentBlock(args: { lineStart: number, lines: string[] }): CommentBlock {
    return {
        kind: "CommentBlock",
        ...args,
    };
}

type MultilineCommentBlock = {
    kind: "MultilineCommentBlock";
    lineStart: number;
    lines: string[];
};

function MultilineCommentBlock(args: { lineStart: number, lines: string[] }): MultilineCommentBlock {
    return {
        kind: "MultilineCommentBlock",
        ...args,
    };
}

type UnknownBlock = {
    kind: "UnknownBlock";
    lineStart: number;
    lines: string[];
};

function UnknownBlock(args: { lineStart: number, lines: string[] }): UnknownBlock {
    return {
        kind: "UnknownBlock",
        ...args,
    };
}

type UnparsedBlock = ImportBlock | ExportBlock | UnionTypeBlock | TypeAliasBlock | FunctionBlock | ConstBlock | CommentBlock | MultilineCommentBlock | UnknownBlock;

function hasTypeLine(block: string): boolean {
    const _res1328002030 = block.split(":");
    switch (_res1328002030.length) {
        case _res1328002030.length: {
            if (_res1328002030.length === 1) {
                const [ x ] = _res1328002030;
                return false;
            }
        }
        case _res1328002030.length: {
            if (_res1328002030.length >= 1) {
                const [ x, ...xs ] = _res1328002030;
                const trimmed: string = x.trim();
                const split: string[] = trimmed.split(" ");
                const length: number = split.length;
                return length === 1;
            }
        }
        default: {
            return false;
        }
    }
}

function isAFunction(block: string): boolean {
    const _res1780524276 = block.split("\n");
    switch (_res1780524276.length) {
        case _res1780524276.length: {
            if (_res1780524276.length >= 1) {
                const [ firstLine, ...xs ] = _res1780524276;
                return (function(y: any) {
            return y.length > 1;
        })(firstLine.split("->"));
            }
        }
        default: {
            return false;
        }
    }
}

const validators: Validator[] = [ {
    test: function(x: any) {
    return x.startsWith("--");
},
    blockKind: "Comment"
}, {
    test: function(x: any) {
    return x.startsWith("{-");
},
    blockKind: "MultilineComment"
}, {
    test: function(x: any) {
    return x.startsWith("type alias");
},
    blockKind: "TypeAlias"
}, {
    test: function(x: any) {
    return x.startsWith("type ");
},
    blockKind: "UnionType"
}, {
    test: function(x: any) {
    return x.startsWith(" ") || x.startsWith("}");
},
    blockKind: "Indent"
}, {
    test: function(x: any) {
    return x.startsWith("import");
},
    blockKind: "Import"
}, {
    test: function(x: any) {
    return x.startsWith("exposing");
},
    blockKind: "Export"
}, {
    test: function(x: any) {
    return hasTypeLine(x) && isAFunction(x);
},
    blockKind: "Function"
}, {
    test: function(x: any) {
    return hasTypeLine(x);
},
    blockKind: "Const"
}, {
    test: function(x: any) {
    return (function(y: any) {
    return y.length > 1;
})(x.split("="));
},
    blockKind: "Definition"
} ];

function blockKindStep(block: string, validators: Validator[]): Result<string, BlockKinds> {
    switch (validators.length) {
        case validators.length: {
            if (validators.length >= 1) {
                const [ validator, ...ys ] = validators;
                if (validator.test(block)) {
                return Ok({ value: validator.blockKind });
            } else {
                return blockKindStep(block, ys);
            };
            }
        }
        default: {
            return Err({ error: "Unknown block type" });
        }
    }
}

function blockKind(block: string): Result<string, BlockKinds> {
    return blockKindStep(block, validators);
}

function createUnparsedBlock(blockKind: BlockKinds, lineStart: number, lines: string[]): UnparsedBlock {
    switch (blockKind) {
        case "Import": {
            return ImportBlock({
            lineStart,
            lines
        });
        }
        case "Export": {
            return ExportBlock({
            lineStart,
            lines
        });
        }
        case "Const": {
            return ConstBlock({
            lineStart,
            lines
        });
        }
        case "Function": {
            return FunctionBlock({
            lineStart,
            lines
        });
        }
        case "UnionType": {
            return UnionTypeBlock({
            lineStart,
            lines
        });
        }
        case "TypeAlias": {
            return TypeAliasBlock({
            lineStart,
            lines
        });
        }
        case "Indent": {
            return UnknownBlock({
            lineStart,
            lines
        });
        }
        case "Definition": {
            return UnknownBlock({
            lineStart,
            lines
        });
        }
        case "Comment": {
            return CommentBlock({
            lineStart,
            lines
        });
        }
        case "MultilineComment": {
            return MultilineCommentBlock({
            lineStart,
            lines
        });
        }
        case "Unknown": {
            return UnknownBlock({
            lineStart,
            lines
        });
        }
    }
}

type IntoBlockInfo = {
    currentBlock: string[];
    previousLine: string;
    currentBlockKind: Result<string, BlockKinds>;
    lineStart: number;
}

function IntoBlockInfo(args: { currentBlock: string[], previousLine: string, currentBlockKind: Result<string, BlockKinds>, lineStart: number }): IntoBlockInfo {
    return {
        ...args,
    };
}

function stepMultilineComment(lineNumber: number, info: IntoBlockInfo, line: string, lines: string[]): UnparsedBlock[] {
    if (line === "-}") {
        const infoWithCurrentLine: IntoBlockInfo = {
            ...info,
            previousLine: line,
            currentBlock: List.append(info.currentBlock, [ line ])
        };
        const block: UnparsedBlock = createUnparsedBlock("MultilineComment", infoWithCurrentLine.lineStart, infoWithCurrentLine.currentBlock);
        const nextInfo: IntoBlockInfo = {
            currentBlock: [ ],
            previousLine: line,
            lineStart: lineNumber,
            currentBlockKind: Err({ error: "Nothing" })
        };
        return [ block, ...intoBlocksStep(lineNumber + 1, nextInfo, lines) ];
    } else {
        const infoWithCurrentLine: IntoBlockInfo = {
            ...info,
            previousLine: line,
            currentBlock: List.append(info.currentBlock, [ line ])
        };
        return intoBlocksStep(lineNumber + 1, infoWithCurrentLine, lines);
    }
}

function indentOrDefinitionStep(lineNumber: number, info: IntoBlockInfo, line: string, lines: string[]): UnparsedBlock[] {
    const nextLines: string[] = lineNumber > 0 && info.previousLine.trim() === "" ? [ info.previousLine, line ] : [ line ];
    const nextInfo: IntoBlockInfo = {
        ...info,
        currentBlock: List.append(info.currentBlock, nextLines),
        previousLine: line
    };
    return intoBlocksStep(lineNumber + 1, nextInfo, lines);
}

function intoBlocksStep(lineNumber: number, info: IntoBlockInfo, lines: string[]): UnparsedBlock[] {
    switch (lines.length) {
        case lines.length: {
            if (lines.length >= 1) {
                const [ line, ...xs ] = lines;
                if (line.trim().length === 0) {
                const nextInfo: IntoBlockInfo = { ...info, previousLine: line };
                return intoBlocksStep(lineNumber + 1, nextInfo, xs);
            } else {
                switch (info.currentBlock.length) {
                    case 0: {
                        const nextInfo: IntoBlockInfo = {
                            previousLine: line,
                            currentBlock: [ line ],
                            lineStart: lineNumber,
                            currentBlockKind: blockKind(line)
                        };
                        return intoBlocksStep(lineNumber + 1, nextInfo, xs);
                    }
                    default: {
                        const isInMultilineComment: boolean = info.currentBlockKind.kind === "Ok" && info.currentBlockKind.value === "MultilineComment";
                        if (isInMultilineComment) {
                            return stepMultilineComment(lineNumber, info, line, xs);
                        } else {
                            const currentLineBlockKind: Result<string, BlockKinds> = blockKind(line);
                            const isIndent: boolean = currentLineBlockKind.kind === "Ok" && currentLineBlockKind.value === "Indent";
                            const isDefinition: boolean = currentLineBlockKind.kind === "Ok" && currentLineBlockKind.value === "Definition";
                            if (isIndent || isDefinition) {
                                return indentOrDefinitionStep(lineNumber, info, line, xs);
                            } else {
                                switch (info.currentBlockKind.kind) {
                                    case "Ok": {
                                        const { value } = info.currentBlockKind;
                                        const block: UnparsedBlock = createUnparsedBlock(value, info.lineStart, info.currentBlock);
                                        const nextInfo: IntoBlockInfo = {
                                            previousLine: line,
                                            currentBlock: [ line ],
                                            lineStart: lineNumber,
                                            currentBlockKind: currentLineBlockKind
                                        };
                                        return [ block, ...intoBlocksStep(lineNumber + 1, nextInfo, xs) ];
                                    }
                                    case "Err": {
                                        const nextInfo: IntoBlockInfo = {
                                            ...info,
                                            previousLine: line,
                                            currentBlock: List.append(info.currentBlock, [ line ])
                                        };
                                        return intoBlocksStep(lineNumber + 1, nextInfo, xs);
                                    }
                                };
                            };
                        };
                    }
                };
            };
            }
        }
        default: {
            if (info.currentBlock.length > 0) {
                switch (info.currentBlockKind.kind) {
                    case "Ok": {
                        const { value } = info.currentBlockKind;
                        return [ createUnparsedBlock(value, info.lineStart, info.currentBlock) ];
                    }
                    case "Err": {
                        return [ createUnparsedBlock("Unknown", info.lineStart, info.currentBlock) ];
                    }
                };
            } else {
                return [ ];
            };
        }
    }
}

function intoBlocks(body: string): UnparsedBlock[] {
    const lines: string[] = body.split("\n");
    return intoBlocksStep(0, {
        previousLine: "",
        currentBlock: [ ],
        currentBlockKind: Err({ error: "Nothing" }),
        lineStart: 0
    }, lines);
}

function typeBlocks(blocks: Block[]): TypedBlock[] {
    return List.filter(function(block: any) {
        return block.kind === "UnionType" || block.kind === "TypeAlias";
    }, blocks);
}

type Export = {
    kind: "Export";
    names: string[];
};

function Export(args: { names: string[] }): Export {
    return {
        kind: "Export",
        ...args,
    };
}

type MyExport = Export;

function exportTests(module: Module): MyExport {
    const isTest: boolean = isTestFile(module.name);
    const namesToExpose: string[] = isTest ? List.filter(function(name: any) {
        return name.startsWith("test");
    }, List.map(function(block: any) {
        return block.name;
    }, List.filter(function(block: any) {
        return block.kind === "Function" || block.kind === "Const";
    }, module.body))) : [ ];
    const exports: Export[] = List.filter(function(block: any) {
        return block.kind === "Export";
    }, module.body);
    const exportNames: string[] = List.foldl(function(export_: any, allNames: any) {
        return List.append(export_.names, allNames);
    }, [ ], exports);
    const exposeWithoutDuplicates: string[] = List.filter(function(name: any) {
        return exportNames.includes(name);
    }, namesToExpose);
    return Export({ names: exposeWithoutDuplicates });
}
