import { Just } from "@eeue56/ts-core/build/main/lib/maybe";
import {
    Export,
    Expression,
    FormatStringValue,
    FunctionCall,
    Import,
    LambdaCall,
    LeftPipe,
    ListDestructurePart,
    ListRange,
    ModuleReference,
    StringValue,
    Value,
} from "../types";
import { getNameFromPath } from "../utils";

export function generateValue(value: Value): string {
    return value.body;
}

export function generateStringValue(string: StringValue): string {
    return `"${string.body}"`;
}

export function generateFormatStringValue(string: FormatStringValue): string {
    return `\`${string.body}\``;
}

export function generateListRange(list: ListRange): string {
    const gap = `${list.end.body} - ${list.start.body} + 1`;

    return `Array.from({ length: ${gap} }, (x, i) => i + ${list.start.body})`;
}

export function generateListDestructurePart(part: ListDestructurePart): string {
    switch (part.kind) {
        case "EmptyList": {
            return "[]";
        }
        case "StringValue": {
            return part.body;
        }
        case "FormatStringValue": {
            return part.body;
        }
        case "Value": {
            return part.body;
        }
        case "Destructure": {
            const pattern = part.pattern ? ` ${part.pattern}` : "";
            return `${part.constructor}${pattern}`;
        }
    }
}

function addArgsToModuleReference(
    moduleReference: ModuleReference,
    newArgs: Expression[]
): ModuleReference {
    switch (moduleReference.value.kind) {
        case "FunctionCall": {
            const args = [ ...moduleReference.value.args, ...newArgs ];
            const innerFunction = FunctionCall(
                moduleReference.value.name,
                args
            );

            return ModuleReference(moduleReference.path, innerFunction);
        }

        case "Value": {
            const args = [ ...newArgs ];
            const innerFunction = FunctionCall(
                moduleReference.value.body,
                args
            );

            return ModuleReference(moduleReference.path, innerFunction);
        }
    }

    return moduleReference;
}

export function flattenLeftPipe(leftPipe: LeftPipe): Expression {
    const left = leftPipe.left;
    const right = leftPipe.right;

    switch (right.kind) {
        case "FunctionCall": {
            const args = [ ...right.args, left ];
            return FunctionCall(right.name, args);
        }

        case "Value": {
            const args = [ left ];
            return FunctionCall(right.body, args);
        }

        case "ModuleReference": {
            return addArgsToModuleReference(right, [ left ]);
        }

        case "Lambda": {
            return LambdaCall(right, [ left ]);
        }

        case "LeftPipe": {
            let innerFunction = null;
            switch (right.left.kind) {
                case "FunctionCall": {
                    const args = [ ...right.left.args, left ];
                    innerFunction = FunctionCall(right.left.name, args);
                    break;
                }

                case "Value": {
                    const args = [ left ];
                    innerFunction = FunctionCall(right.left.body, args);
                    break;
                }

                case "ModuleReference": {
                    innerFunction = addArgsToModuleReference(right.left, [
                        left,
                    ]);
                    break;
                }

                case "LeftPipe": {
                    return right;
                }
            }

            if (innerFunction === null) return right.left;
            return flattenLeftPipe(LeftPipe(innerFunction, right.right));
        }
    }
}

export function generateImportBlock(imports: Import): string {
    return imports.modules
        .filter((module) => module.name !== "globalThis")
        .map((module) => {
            if (module.namespace === "Relative") {
                const withoutQuotes = module.name.slice(1, -1);
                const name =
                    module.alias.kind === "just"
                        ? module.alias.value
                        : getNameFromPath(withoutQuotes);

                const filteredExposing =
                    module.alias.kind === "nothing"
                        ? module.exposing
                        : module.exposing.filter(
                              (expose) =>
                                  expose !==
                                  (module.alias as Just<string>).value
                          );
                const exposing = `import { ${filteredExposing.join(
                    ", "
                )} } from ${module.name};`;

                if (module.exposing.length === 0) {
                    return `import * as ${name} from ${module.name};`;
                } else {
                    if (module.alias.kind === "just") {
                        return `import * as ${name} from ${module.name};
${exposing}`;
                    }
                    return exposing;
                }
            }
            const name =
                module.alias.kind === "just" ? module.alias.value : module.name;
            const exposing = `import { ${module.exposing.join(", ")} } from "${
                module.name
            }";`;

            if (module.exposing.length === 0) {
                return `import * as ${name} from "${module.name}";`;
            } else {
                if (module.alias.kind === "just") {
                    return `import * as ${name} from "${module.name}";
${exposing}`;
                }

                return exposing;
            }
        })
        .join("\n");
}

export function generateExportBlock(exports: Export): string {
    return exports.names
        .map((name) => {
            return `export { ${name} };`;
        })
        .join("\n");
}
