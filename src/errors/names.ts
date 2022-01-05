import { Block, ContextModule, Expression, Value } from "../types";
import { suggestName } from "./distance";

function isNumberLiteral(value: Value): boolean {
    return !isNaN(parseInt(value.body, 10));
}

function namesPerExpression(expression: Expression): string[] {
    switch (expression.kind) {
        case "Value":
            if (isNumberLiteral(expression)) {
                return [ ];
            }
            return [ expression.body ];
        case "StringValue":
            return [ ];
        case "FormatStringValue":
            return [ ];
        case "ListValue": {
            let results: string[] = [ ];
            for (const innerExpression of expression.items) {
                results = results.concat(namesPerExpression(innerExpression));
            }
            return results;
        }
        case "ListRange": {
            return [
                ...namesPerExpression(expression.start),
                ...namesPerExpression(expression.end),
            ];
        }
        case "ObjectLiteral":
            return [ ];
        case "IfStatement":
            return [
                ...namesPerExpression(expression.ifBody),
                ...namesPerExpression(expression.elseBody),
                ...namesPerExpression(expression.predicate),
            ];
        case "CaseStatement": {
            return [ ...namesPerExpression(expression.predicate) ];
        }
        case "Addition":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "Subtraction":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "Multiplication":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "Division":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "And":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "Or":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "LeftPipe":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "RightPipe":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "ModuleReference":
            return [
                expression.path.join(".") +
                    "." +
                    namesPerExpression(expression.value),
            ];
        case "FunctionCall": {
            let results: string[] = [ expression.name ];
            for (const innerExpression of expression.args) {
                results = results.concat(namesPerExpression(innerExpression));
            }
            return results;
        }
        case "Lambda": {
            return [ ];
            // return [
            //     ...expression.args,
            //     ...namesPerExpression(expression.body),
            // ];
        }
        case "LambdaCall":
            return [ ];
        case "Constructor":
            return [ ];
        case "Equality":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "InEquality":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "LessThan":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "LessThanOrEqual":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "GreaterThan":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
        case "GreaterThanOrEqual":
            return [
                ...namesPerExpression(expression.left),
                ...namesPerExpression(expression.right),
            ];
    }
}

export function topLevelNamesPerBlock(block: Block): string[] {
    switch (block.kind) {
        case "Comment": {
            return [ ];
        }
        case "Const": {
            return [ block.name ];
        }
        case "Export": {
            return [ ];
        }
        case "Function": {
            return [ block.name ];
        }
        case "Import": {
            let results: string[] = [ ];
            for (const module of block.modules) {
                results = results.concat(module.exposing);
            }
            return results;
        }
        case "MultilineComment": {
            return [ ];
        }
        case "TypeAlias": {
            return [ ];
        }
        case "UnionType": {
            return [ ];
        }
    }
}

export function definedNamesPerBlock(block: Block): string[] {
    switch (block.kind) {
        case "Comment": {
            return [ ];
        }
        case "Const": {
            return [ block.name ];
        }
        case "Export": {
            return [ ];
        }
        case "Function": {
            let results = [ block.name ];

            for (const arg of block.args) {
                if (arg.kind === "FunctionArg") {
                    results.push(arg.name);
                } else {
                    results.push(`${arg.index}`);
                }
            }

            for (const letBlock of block.letBody) {
                results = results.concat(definedNamesPerBlock(letBlock));
            }
            return results;
        }
        case "Import": {
            return [ ];
        }
        case "MultilineComment": {
            return [ ];
        }
        case "TypeAlias": {
            return [ ];
        }
        case "UnionType": {
            return [ ];
        }
    }
}

export function namesPerBlock(block: Block): string[] {
    switch (block.kind) {
        case "Comment": {
            return [ ];
        }
        case "Const": {
            return [ block.name, ...namesPerExpression(block.value) ];
        }
        case "Export": {
            return [ ];
        }
        case "Function": {
            return [ block.name, ...namesPerExpression(block.body) ];
        }
        case "Import": {
            return [ ];
        }
        case "MultilineComment": {
            return [ ];
        }
        case "TypeAlias": {
            return [ ];
        }
        case "UnionType": {
            return [ ];
        }
    }
}

function isGlobal(str: string) {
    if (str.split(".")[0] === "globalThis") {
        return true;
    }

    return false;
}

export function addMissingNamesSuggestions(
    module: ContextModule
): ContextModule {
    let topLevelNames: string[] = [ ];
    for (const names of module.body.map(topLevelNamesPerBlock)) {
        topLevelNames = topLevelNames.concat(names);
    }

    const nameSuggestions: string[] = [ ];

    module.body.forEach((block) => {
        const blockName =
            (block.kind === "Function" && block.name) ||
            (block.kind === "Const" && block.name);
        namesPerBlock(block).forEach((name) => {
            if (isGlobal(name)) {
                return;
            }

            const knownNames = [
                ...topLevelNames,
                ...definedNamesPerBlock(block),
            ];

            if (knownNames.indexOf(name) === -1) {
                const suggestions = suggestName(name, knownNames);
                if (suggestions.length > 0) {
                    nameSuggestions.push(
                        `Couldn't find \`${name}\` in the scope of \`${blockName}\`. Perhaps you meant: ${suggestions.join(
                            ", "
                        )}?`
                    );
                } else {
                    nameSuggestions.push(
                        `Failed to find \`${name}\` in the scope of \`${blockName}\`.`
                    );
                }
            }
        });
    });

    module.errors = module.errors.concat(nameSuggestions);

    return module;
}
