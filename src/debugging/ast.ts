import {
    Block,
    Branch,
    BranchPattern,
    DoExpression,
    Expression,
    Field,
    FunctionArgsUnion,
    ImportModule,
    Type,
} from "../types";

function importModuleToString(module: ImportModule): string {
    const alias =
        module.alias.kind === "Nothing"
            ? "Nothing()"
            : `Just("${module.alias.value}")`;
    const exposing = module.exposing.map((e) => `"${e}"`).join(", ");
    return `ImportModule("${module.name}", ${alias}, [ ${exposing} ], "${module.namespace}")`;
}

function typeToString(type_: Type): string {
    switch (type_.kind) {
        case "FixedType": {
            return `FixedType("${type_.name}", [ ${type_.args
                .map(typeToString)
                .join(", ")} ])`;
        }
        case "FunctionType": {
            return ``;
        }
        case "GenericType": {
            return `GenericType("${type_.name}")`;
        }
    }
}

function fieldToString(field: Field): string {
    return `Field("${field.name}", ${expressionToString(field.value)})`;
}

function branchPatternToString(pattern: BranchPattern): string {
    switch (pattern.kind) {
        case "Default": {
            return `Default()`;
        }
        case "Destructure": {
            return `Destructure("${pattern.constructor}", "${pattern.pattern}")`;
        }
        case "EmptyList": {
            return `EmptyList()`;
        }
        case "FormatStringValue": {
            return `FormatStringValue("${pattern.body}")`;
        }
        case "ListDestructure": {
            return `ListDestructure(${pattern.parts})`;
        }
        case "StringValue": {
            return `StringValue("${pattern.body}")`;
        }
    }
}

function branchToString(branch: Branch): string {
    return `Branch(${branchPatternToString(
        branch.pattern
    )}, ${expressionToString(branch.body)}, [ ${branch.letBody
        .map(blockToString)
        .join(", ")} ])`;
}

function expressionToString(expression: Expression): string {
    switch (expression.kind) {
        case "Value":
            return `Value("${expression.body}")`;
        case "StringValue":
            return `StringValue("${expression.body}")`;
        case "FormatStringValue":
            return `FormatStringValue("${expression.body}")`;
        case "ListValue":
            return `ListValue([ ${expression.items
                .map(expressionToString)
                .join("\n,")}) ]`;
        case "ListRange":
            return `ListRange(Value("${expression.start})"), Value("${expression.end}"))`;
        case "ObjectLiteral": {
            const base =
                expression.base === null
                    ? `null`
                    : `Value("${expression.base}")`;
            return `ObjectLiteral(${base}, [ ${expression.fields
                .map(fieldToString)
                .join(", ")} ])`;
        }
        case "IfStatement":
            return `IfStatement(${expressionToString(
                expression.predicate
            )}, ${expressionToString(
                expression.ifBody
            )}, [ ${expression.ifLetBody
                .map(blockToString)
                .join(", ")} ], ${expressionToString(
                expression.elseBody
            )}, [ ${expression.elseLetBody.map(blockToString).join(", ")} ])`;
        case "CaseStatement":
            return `CaseStatement(${expressionToString(
                expression.predicate
            )}, [ ${expression.branches.map(branchToString).join(", ")} ])`;
        case "Addition":
            return `Addition(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "Subtraction":
            return `Subtraction(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "Multiplication":
            return `Multiplication(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "Division":
            return `Division(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "Mod":
            return `Mod(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "And":
            return `And(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "Or":
            return `Or(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "ListPrepend":
            return `ListPrepend(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "LeftPipe":
            return `LeftPipe(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "RightPipe":
            return `RightPipe(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "ModuleReference":
            return `ModuleReference([ ${expression.path
                .map((p) => `"${p}"`)
                .join(", ")} ], ${expressionToString(expression.value)})`;
        case "FunctionCall":
            return `FunctionCall("${expression.name}", [ ${expression.args
                .map(expressionToString)
                .join(", ")} ])`;
        case "Lambda":
            return `Lambda([ ${expression.args
                .map((e) => `"${e}"`)
                .join(", ")} ], ${expressionToString(expression.body)} )`;
        case "LambdaCall":
            return `LambdaCall([ ${expression.args
                .map(expressionToString)
                .join(", ")} ], ${expressionToString(expression.lambda)})`;
        case "Constructor":
            return `Constructor("${
                expression.constructor
            }", ${expressionToString(expression.pattern)})`;
        case "Equality":
            return `Equality(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "InEquality":
            return `InEquality(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "LessThan":
            return `LessThan(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "LessThanOrEqual":
            return `LessThanOrEqual(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "GreaterThan":
            return `GreaterThan(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
        case "GreaterThanOrEqual":
            return `GreaterThanOrEqual(${expressionToString(
                expression.left
            )}, ${expressionToString(expression.right)})`;
    }
}

function doExpressionToString(expression: DoExpression): string {
    switch (expression.kind) {
        case "Const":
        case "Function":
            return blockToString(expression);
        case "FunctionCall":
        case "ModuleReference":
        case "IfStatement":
            return expressionToString(expression);
    }
}

function functionArgsUnionToString(arg: FunctionArgsUnion): string {
    switch (arg.kind) {
        case "AnonFunctionArg": {
            return `AnonFunctionArg(${arg.index}, ${typeToString(arg.type)})`;
        }
        case "FunctionArg": {
            return `FunctionArg("${arg.name}", ${typeToString(arg.type)})`;
        }
    }
}

function blockToString(block: Block): string {
    switch (block.kind) {
        case "Comment": {
            return `Comment()`;
        }
        case "Const": {
            return `Const("${block.name}", ${typeToString(
                block.type
            )}, [ ${block.letBody
                .map(blockToString)
                .join(", ")} ], ${expressionToString(block.value)})`;
        }
        case "Export": {
            return `Export(${block.names})`;
        }
        case "Function": {
            const args =
                "[ " +
                block.args.map(functionArgsUnionToString).join(", ") +
                " ]";
            const maybeDoBlock = block.doBody
                ? `, DoBlock(${block.doBody?.expressions
                      .map(doExpressionToString)
                      .join(", ")})`
                : "";
            return `Function("${block.name}", ${typeToString(
                block.returnType
            )}, ${args}, [ ${block.letBody
                .map(blockToString)
                .join(", ")} ], ${expressionToString(
                block.body
            )}${maybeDoBlock})`;
        }
        case "Import": {
            return `Import([ ${block.modules
                .map(importModuleToString)
                .join(", ")} ])`;
        }
        case "MultilineComment": {
            return `MultilineComment()`;
        }
        case "TypeAlias": {
            return `TypeAlias(${typeToString(block.type)}, ${
                block.properties
            })`;
        }
        case "UnionType": {
            return `UnionType(${typeToString(block.type)}, ${block.tags})`;
        }
        case "UnionUntaggedType": {
            return `UnionType(${typeToString(block.type)}, [ ${block.values
                .map((v) => `"${v.body}"`)
                .join(",")} ])`;
        }
    }
}

export function astToString(blocks: Block[]): string {
    return "[" + blocks.map(blockToString).join(", ") + "]";
}
