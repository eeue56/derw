import { type } from "os";
import {
    UnionType,
    Block,
    Module,
    Function,
    Expression,
    Value,
    IfStatement,
    Type,
    FixedType,
    CaseStatement,
    Branch,
    Constructor,
    StringValue,
    Const,
    FormatStringValue,
    Addition,
    ListValue,
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
                .map((arg) => arg.name + ": " + generateType(arg.type) + ";")
                .join("\n    ");

            const funcDefProps = tag.args
                .map((arg) => arg.name.trim())
                .join(",\n        ");

            const funcDefArgs = tag.args
                .map((arg) => arg.name + ": " + generateType(arg.type))
                .join(", ");

            const generatedType = generateType(
                FixedType(
                    tag.name,
                    tag.args.map((arg) => arg.type)
                )
            );

            const funcDefArgsStr =
                tag.args.length > 0 ? `{ ${funcDefArgs} }` : "{}";

            return `
type ${generatedType} = {
    kind: "${tag.name}";${
                typeDefArgs.length === 0 ? "" : "\n    " + typeDefArgs
            }
};

function ${generatedType}(args: ${funcDefArgsStr}): ${generatedType} {
    return {
        kind: "${tag.name}",
        ...args,
    };
}`;
        })
        .join("\n");

    const tags = syntax.tags
        .map((tag) => {
            return generateType(
                FixedType(
                    tag.name,
                    tag.args.map((arg) => arg.type)
                )
            );
        })
        .join(" | ");

    return `
${tagCreators}

type ${generateType(syntax.type)} = ${tags};
`.trim();
}

function generateValue(value: Value): string {
    return value.body;
}

function generateStringValue(string: StringValue): string {
    return `"${string.body}"`;
}

function generateFormatStringValue(string: FormatStringValue): string {
    return `\`${string.body}\``;
}

function generateListValue(list: ListValue): string {
    if (list.items.length === 0) return `[ ]`;
    return `[ ${list.items.map(generateExpression).join(", ")} ]`;
}

function generateIfStatement(ifStatement: IfStatement): string {
    return `if (${generateExpression(ifStatement.predicate)}) {
    return ${generateExpression(ifStatement.ifBody)};
} else {
    return ${generateExpression(ifStatement.elseBody)};
}`;
}

function generateConstructor(constructor: Constructor): string {
    // TODO: This should be handled in the parser.

    return `${constructor.constructor}(${constructor.pattern})`;
}

function generateBranch(predicate: string, branch: Branch): string {
    const pattern =
        branch.pattern.pattern.trim().length > 0
            ? `\n    const ${branch.pattern.pattern} = ${predicate};`
            : "";
    return `case "${branch.pattern.constructor}": {${pattern}
    return ${generateExpression(branch.body)};
}`;
}

function generateCaseStatement(caseStatement: CaseStatement): string {
    const predicate = generateExpression(caseStatement.predicate);
    const branches = caseStatement.branches.map((branch) =>
        generateBranch(predicate, branch)
    );

    return `switch (${predicate}.kind) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
}

function generateType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            return type_.name;
        }
        case "FixedType": {
            if (type_.name === "List") {
                const fixedArgs = type_.args.filter(
                    (type_) => type_.kind === "FixedType"
                );

                if (fixedArgs.length === 0) {
                    return "any[]";
                } else if (fixedArgs.length === 1) {
                    return `${generateType(fixedArgs[0])}[]`;
                }

                return `(${fixedArgs.map(generateType).join(" | ")})[]`;
            }

            const args = type_.args.filter(
                (type_) => type_.kind === "GenericType"
            );
            if (args.length === 0) {
                return type_.name;
            }

            return `${type_.name}<${args.map(generateType).join(", ")}>`;
        }
    }
}

function generateAddition(addition: Addition): string {
    const left = generateExpression(addition.left);
    const right = generateExpression(addition.right);

    return `${left} + ${right}`;
}

function generateExpression(expression: Expression): string {
    switch (expression.kind) {
        case "Value":
            return generateValue(expression);
        case "StringValue":
            return generateStringValue(expression);
        case "FormatStringValue":
            return generateFormatStringValue(expression);
        case "ListValue":
            return generateListValue(expression);
        case "IfStatement":
            return generateIfStatement(expression);
        case "CaseStatement":
            return generateCaseStatement(expression);
        case "Addition":
            return generateAddition(expression);
        case "Constructor":
            return generateConstructor(expression);
    }
}

function collectTypeArguments(type_: Type): string[] {
    switch (type_.kind) {
        case "GenericType":
            return [ type_.name ];
        case "FixedType":
            const args: string[][] = type_.args.map(collectTypeArguments);
            return ([ ] as string[]).concat(...args);
    }
}

function generateFunction(function_: Function): string {
    const functionArguments = function_.args
        .map((arg) => arg.name + ": " + generateType(arg.type))
        .join(", ");

    const returnType = generateType(function_.returnType);
    const body = generateExpression(function_.body);
    const prefixedBody = prefixLines(body, 4);
    const typeArguments = ([ ] as string[])
        .concat(
            ...function_.args.map((arg) => collectTypeArguments(arg.type)),
            collectTypeArguments(function_.returnType)
        )
        .filter((value, index, arr) => arr.indexOf(value) === index);

    const typeArgumentsString =
        typeArguments.length === 0 ? "" : `<${typeArguments.join(", ")}>`;

    return `
function ${function_.name}${typeArgumentsString}(${functionArguments}): ${returnType} {
${prefixedBody}
}`.trim();
}

function generateConst(constDef: Const): string {
    const body = generateExpression(constDef.value);
    const typeDef = generateType(constDef.type);
    return `
const ${constDef.name}: ${typeDef} = ${body};
`.trim();
}

function generateBlock(syntax: Block): string {
    switch (syntax.kind) {
        case "UnionType":
            return generateUnionType(syntax);
        case "Function":
            return generateFunction(syntax);
        case "Const":
            return generateConst(syntax);
    }
}

export function generateTypescript(module: Module): string {
    return module.body.map(generateBlock).join("\n\n");
}
