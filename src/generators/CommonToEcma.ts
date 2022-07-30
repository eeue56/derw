import * as List from "../stdlib/List";

import { Value, StringValue, FormatStringValue, ListRange, ListDestructurePart, ModuleReference, Expression, LeftPipe, Lambda, Export, ImportModule, Import } from "../types";

import { getNameFromPath } from "../utils";

export { generateValue };
export { generateStringValue };
export { generateFormatStringValue };
export { generateListRange };
export { generateListDestructurePart };
export { flattenLeftPipe };
export { generateImportBlock };
export { generateExportBlock };

type FunctionCall = {
    kind: "FunctionCall";
    name: string;
    args: Expression[];
};

function FunctionCall(args: { name: string, args: Expression[] }): FunctionCall {
    return {
        kind: "FunctionCall",
        ...args,
    };
}

type LambdaCall = {
    kind: "LambdaCall";
    args: Expression[];
    lambda: Lambda;
};

function LambdaCall(args: { args: Expression[], lambda: Lambda }): LambdaCall {
    return {
        kind: "LambdaCall",
        ...args,
    };
}

type MyExpressions = FunctionCall | LambdaCall;

function generateValue(value: Value): string {
    return value.body;
}

function generateStringValue(string: StringValue): string {
    return `"${string.body}"`;
}

function generateFormatStringValue(string: FormatStringValue): string {
    return "`" + string.body + "`";
}

function generateListRange(list: ListRange): string {
    const gap: string = `${list.end.body} - ${list.start.body} + 1`;
    return `Array.from({ length: ${gap} }, (x, i) => i + ${list.start.body})`;
}

function generateListDestructurePart(part: ListDestructurePart): string {
    switch (part.kind) {
        case "EmptyList": {
            return "[]";
        }
        case "StringValue": {
            const { body } = part;
            return body;
        }
        case "FormatStringValue": {
            const { body } = part;
            return body;
        }
        case "Value": {
            const { body } = part;
            return body;
        }
        case "Destructure": {
            const { constructor, pattern } = part;
            const generatedPattern: string = pattern ? ` ${pattern}` : "";
            return `${constructor}${pattern}`;
        }
    }
}

function addArgsToModuleReference(moduleReference: ModuleReference, newArgs: Expression[]): ModuleReference {
    switch (moduleReference.value.kind) {
        case "FunctionCall": {
            const { args, name } = moduleReference.value;
            return { ...moduleReference, value: FunctionCall({
            name,
            args: List.append(args, newArgs)
        }) };
        }
        case "Value": {
            const { body } = moduleReference.value;
            return { ...moduleReference, value: FunctionCall({
            name: body,
            args: newArgs
        }) };
        }
        default: {
            return moduleReference;
        }
    }
}

function flattenLeftPipe(leftPipe: LeftPipe): any {
    const left: Expression = leftPipe.left;
    const right: Expression = leftPipe.right;
    switch (right.kind) {
        case "FunctionCall": {
            const { name, args } = right;
            return FunctionCall({
            name,
            args: List.append(args, [ left ])
        });
        }
        case "Value": {
            const { body } = right;
            return FunctionCall({
            name: body,
            args: [ left ]
        });
        }
        case "ModuleReference": {
            return addArgsToModuleReference(right, [ left ]);
        }
        case "Lambda": {
            return LambdaCall({
            lambda: right,
            args: [ left ]
        });
        }
        case "LeftPipe": {
            switch (right.left.kind) {
                case "FunctionCall": {
                    const { args, name } = right.left;
                    const fn: FunctionCall = FunctionCall({
                        name,
                        args: List.append(args, [ left ])
                    });
                    return flattenLeftPipe({
                    kind: "LeftPipe",
                    left: fn,
                    right: right.right
                });
                }
                case "Value": {
                    const { body } = right.left;
                    const fn: FunctionCall = FunctionCall({
                        name: body,
                        args: [ left ]
                    });
                    return flattenLeftPipe({
                    kind: "LeftPipe",
                    left: fn,
                    right: right.right
                });
                }
                case "ModuleReference": {
                    const fn: ModuleReference = addArgsToModuleReference(right.left, [ left ]);
                    return flattenLeftPipe({
                    kind: "LeftPipe",
                    left: fn,
                    right: right.right
                });
                }
                case "Lambda": {
                    const fn: any = LambdaCall({
                        lambda: right.left,
                        args: [ left ]
                    });
                    return flattenLeftPipe({
                    kind: "LeftPipe",
                    left: fn,
                    right: right.right
                });
                }
                case "LeftPipe": {
                    return right;
                }
                default: {
                    return right.left;
                }
            };
        }
    }
}

function generateModule(module: ImportModule): string {
    if (module.namespace === "Relative") {
        const withoutQuotes: string = module.name.slice(1, -1);
        const name: string = (function (): any {
            switch (module.alias.kind) {
                case "Just": {
                    const { value } = module.alias;
                    return value;
                }
                case "Nothing": {
                    return getNameFromPath(withoutQuotes);
                }
            }
        })();
        const filteredExposing: string[] = (function (): any {
            switch (module.alias.kind) {
                case "Just": {
                    const { value } = module.alias;
                    return List.filter(function(expose: any) {
                    return expose !== value;
                }, module.exposing);
                }
                case "Nothing": {
                    return module.exposing;
                }
            }
        })();
        const exposed: string = `import { ${filteredExposing.join(", ")} } from ${module.name};`;
        if (module.exposing.length === 0) {
            return `import * as ${name} from ${module.name};`;
        } else {
            switch (module.alias.kind) {
                case "Just": {
                    return `import * as ${name} from ${module.name};\n${exposed}`;
                }
                case "Nothing": {
                    return exposed;
                }
            };
        };
    } else {
        const name: string = (function (): any {
            switch (module.alias.kind) {
                case "Just": {
                    const { value } = module.alias;
                    return value;
                }
                case "Nothing": {
                    return module.name;
                }
            }
        })();
        const exposed: string = `import { ${module.exposing.join(", ")} } from "${module.name}";`;
        if (module.exposing.length === 0) {
            return `import * as ${name} from "${module.name}";`;
        } else {
            switch (module.alias.kind) {
                case "Just": {
                    return `import * as ${name} from "${module.name}";\n${exposed}`;
                }
                case "Nothing": {
                    return exposed;
                }
            };
        };
    }
}

function generateImportBlock(imports: Import): string {
    return (function(y: any) {
        return y.join("\n");
    })(List.map(generateModule, List.filter(function(module: any) {
        return module.name !== "globalThis";
    }, imports.modules)));
}

function generateExportBlock(exports: Export): string {
    return (function(x: any) {
        return x.join("\n");
    })(List.map(function(name: any) {
        return `export { ${name} };`;
    }, exports.names));
}
