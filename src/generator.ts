import {
    UnionType,
    Block,
    Module,
    Function,
    Expression,
    Value,
    IfStatement,
    Type,
} from "./types";

function prefixLines(body: string, indent: number): string {
    return body
        .split("\n")
        .map((line) => " ".repeat(indent) + line)
        .join("\n");
}

function generateUnionType(syntax: UnionType): string {
    const tagCreators = syntax.tags
        .map((tag) => {
            const typeDefArgs = tag.args
                .map((arg) => arg.name + ": " + arg.type.name + ";")
                .join("\n    ");

            const funcDefArgs = tag.args
                .map((arg) => arg.name)
                .join(",\n         ");

            return `
type ${tag.name} = {
    kind: "${tag.name}";${
                typeDefArgs.length === 0 ? "" : "\n    " + typeDefArgs
            }
}

function ${tag.name}(${tag.args.map((arg) => arg.name).join(",")}): ${
                tag.name
            } {
    return {
        kind: "${tag.name}",${
                funcDefArgs.length === 0 ? "" : "\n        " + funcDefArgs
            }
    }
}`;
        })
        .join("\n");

    const tags = syntax.tags
        .map((tag) => {
            return `${tag.name}`;
        })
        .join(" | ");

    return `
${tagCreators}

type ${syntax.type.name} = ${tags};
`.trim();
}

function generateValue(value: Value): string {
    return value.body;
}

function generateIfStatement(ifStatement: IfStatement): string {
    return `if (${generateExpression(ifStatement.predicate)}) {
    return ${generateExpression(ifStatement.ifBody)};
} else {
    return ${generateExpression(ifStatement.elseBody)};
}`;
}

function generateType(type: Type): string {
    return type.name;
}

function generateExpression(expression: Expression): string {
    switch (expression.kind) {
        case "Value":
            return generateValue(expression);
        case "IfStatement":
            return generateIfStatement(expression);
    }
}

function generateFunction(function_: Function): string {
    const functionArguments = function_.args
        .map((arg) => arg.name + ": " + generateType(arg.type))
        .join(", ");

    const returnType = generateType(function_.returnType);
    const body = generateExpression(function_.body);
    const prefixedBody = prefixLines(body, 4);

    return `
function ${function_.name}(${functionArguments}): ${returnType} {
${prefixedBody}
}`.trim();
}

function generateBlock(syntax: Block): string {
    switch (syntax.kind) {
        case "UnionType":
            return generateUnionType(syntax);
        case "Function":
            return generateFunction(syntax);
    }
}

export function generateTypescript(module: Module): string {
    return module.body.map(generateBlock).join("\n\n");
}
