import path from "path";
import { isBuiltinType } from "./builtins";
import {
    Addition,
    And,
    Block,
    Branch,
    CaseStatement,
    Const,
    Constructor,
    Division,
    Equality,
    Export,
    Expression,
    Field,
    FixedType,
    FormatStringValue,
    Function,
    FunctionCall,
    GreaterThan,
    GreaterThanOrEqual,
    IfStatement,
    Import,
    InEquality,
    isSimpleValue,
    Lambda,
    LambdaCall,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListRange,
    ListValue,
    Module,
    ModuleReference,
    Multiplication,
    ObjectLiteral,
    Or,
    Property,
    RightPipe,
    StringValue,
    Subtraction,
    Type,
    TypeAlias,
    UnionType,
    Value,
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

            const funcDefArgs = tag.args
                .map((arg) => arg.name + ": " + generateType(arg.type))
                .join(", ");

            const generatedType = generateType(
                FixedType(
                    tag.name,
                    tag.args
                        .map((arg) => arg.type)
                        .filter((arg) => {
                            if (arg.kind === "FixedType") {
                                if (isBuiltinType(arg.name)) return false;
                            }

                            if (arg.kind === "GenericType") {
                                if (isBuiltinType(arg.name)) return false;
                            }

                            return true;
                        })
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
                    tag.args
                        .map((arg) => arg.type)
                        .filter((arg) => {
                            if (arg.kind === "FixedType") {
                                if (isBuiltinType(arg.name)) return false;
                            }

                            if (arg.kind === "GenericType") {
                                if (isBuiltinType(arg.name)) return false;
                            }

                            return true;
                        })
                )
            );
        })
        .join(" | ");

    return `
${tagCreators}

type ${generateType(syntax.type)} = ${tags};
`.trim();
}

function generateProperty(syntax: Property): string {
    return `${syntax.name}: ${generateType(syntax.type)}`;
}

function generateTypeAlias(syntax: TypeAlias): string {
    const generatedProperties = syntax.properties.map(generateProperty);
    const properties = generatedProperties.join(";\n    ") + ";";
    const type = generateType(syntax.type);
    const args = generatedProperties.join(", ");

    return `
type ${type} = {
    ${properties}
}

function ${type}(args: { ${args} }): ${type} {
    return {
        ...args,
    };
}
`.trim();
}

function generateField(field: Field): string {
    const value = generateExpression(field.value);

    if (field.name === value) {
        return `${field.name}`;
    }

    return `${field.name}: ${value}`;
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    let fields = literal.fields.map(generateField).join(",\n    ");

    if (literal.fields.length === 1) return `{ ${fields} }`;

    return `{
    ${fields}
}`;
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
    if (list.items.length === 1)
        return `[ ${generateExpression(list.items[0])} ]`;
    return `[ ${list.items.map(generateExpression).join(", ")} ]`;
}

function generateListRange(list: ListRange): string {
    const gap = `${list.end.body} - ${list.start.body} + 1`;

    return `Array.from({ length: ${gap} }, (x, i) => i + ${list.start.body})`;
}

function generateIfStatement(ifStatement: IfStatement): string {
    const isSimpleIfBody = isSimpleValue(ifStatement.ifBody.kind);
    const isSimpleElseBody = isSimpleValue(ifStatement.elseBody.kind);

    const ifBodyPrefix = isSimpleIfBody ? "return " : "";
    const elseBodyPrefix = isSimpleElseBody ? "return " : "";

    const ifBody = generateExpression(ifStatement.ifBody);
    const indentedIfBody =
        ifBody.split("\n").length === 1
            ? ifBody
            : [
                  ifBody.split("\n")[0],
                  prefixLines(ifBody.split("\n").slice(1).join("\n"), 4),
              ].join("\n");

    const elseBody = generateExpression(ifStatement.elseBody);
    const indentedElseBody =
        elseBody.split("\n").length === 1
            ? elseBody
            : [
                  elseBody.split("\n")[0],
                  prefixLines(elseBody.split("\n").slice(1).join("\n"), 4),
              ].join("\n");

    return `if (${generateExpression(ifStatement.predicate)}) {
    ${ifBodyPrefix}${indentedIfBody};
} else {
    ${elseBodyPrefix}${indentedElseBody};
}`;
}

function generateConstructor(constructor: Constructor): string {
    if (constructor.pattern.fields.length === 0)
        return `${constructor.constructor}({ })`;
    return `${constructor.constructor}(${generateObjectLiteral(
        constructor.pattern
    )})`;
}

function generateBranch(predicate: string, branch: Branch): string {
    const body = generateExpression(branch.body);
    const returnWrapper = isSimpleValue(branch.body.kind) ? "return " : "";
    switch (branch.pattern.kind) {
        case "Destructure": {
            const pattern =
                branch.pattern.pattern.trim().length > 0
                    ? `\n    const ${branch.pattern.pattern} = ${predicate};`
                    : "";
            return `case "${branch.pattern.constructor}": {${pattern}
    ${returnWrapper}${body};
}`;
        }
        case "StringValue": {
            return `case "${branch.pattern.body}": {
    ${returnWrapper}${body};
}`;
        }
        case "Default": {
            return `default: {
    ${returnWrapper}${body};
}`;
        }
    }
}

function generateCaseStatement(caseStatement: CaseStatement): string {
    const predicate = generateExpression(caseStatement.predicate);
    const branches = caseStatement.branches.map((branch) =>
        generateBranch("_res", branch)
    );

    const isString =
        caseStatement.branches.filter(
            (branch) => branch.pattern.kind === "StringValue"
        ).length > 0;

    if (isString) {
        return `
const _res = ${predicate};
switch (_res) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
    }

    return `
const _res = ${predicate};
switch (_res.kind) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
}

function generateTopLevelType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            return generateType(type_);
        }
        case "FixedType": {
            if (type_.name === "List") {
                return generateType(type_);
            }

            const args = type_.args.filter(
                (type_) =>
                    type_.kind === "GenericType" || type_.kind === "FixedType"
            );
            if (args.length === 0) {
                return type_.name;
            }

            return `${type_.name}<${args.map(generateType).join(", ")}>`;
        }
        case "FunctionType": {
            return generateType(type_);
        }
    }
}

function generateType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            return type_.name;
        }
        case "FixedType": {
            if (type_.name === "List") {
                if (type_.args[0] && type_.args[0].kind === "GenericType") {
                    return generateType(type_.args[0]) + "[]";
                }
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
        case "FunctionType": {
            const parts = [ ];
            let index = 0;
            for (const typePart of type_.args.slice(0, -1)) {
                parts.push(`arg${index}: ${generateType(typePart)}`);
                index++;
            }

            return (
                "(" +
                parts.join(", ") +
                ") => " +
                generateType(type_.args[type_.args.length - 1])
            );
        }
    }
}

// operators

function generateAddition(addition: Addition): string {
    const left = generateExpression(addition.left);
    const right = generateExpression(addition.right);

    return `${left} + ${right}`;
}

function generateSubtraction(subtraction: Subtraction): string {
    const left = generateExpression(subtraction.left);
    const right = generateExpression(subtraction.right);

    return `${left} - ${right}`;
}

function generateMultiplication(multiplication: Multiplication): string {
    const left = generateExpression(multiplication.left);
    const right = generateExpression(multiplication.right);

    return `${left} * ${right}`;
}

function generateDivision(division: Division): string {
    const left = generateExpression(division.left);
    const right = generateExpression(division.right);

    return `${left} / ${right}`;
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

function flattenLeftPipe(leftPipe: LeftPipe): Expression {
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

function generateLeftPipe(leftPipe: LeftPipe): string {
    return generateExpression(flattenLeftPipe(leftPipe));
}

function generateRightPipe(rightPipe: RightPipe): string {
    const left = generateExpression(rightPipe.left);
    const right = generateExpression(rightPipe.right);

    return `${left}(${right})`;
}

function generateModuleReference(moduleReference: ModuleReference): string {
    const left = moduleReference.path.join(".");
    const right = generateExpression(moduleReference.value);

    return `${left}.${right}`;
}

function generateFunctionCall(functionCall: FunctionCall): string {
    const right = functionCall.args.map(generateExpression).join(", ");

    return `${functionCall.name}(${right})`;
}

function generateLambda(lambda: Lambda): string {
    const args = lambda.args.map((arg: any) => `${arg}: any`).join(", ");
    const body = generateExpression(lambda.body);
    return `
function(${args}) {
    return ${body};
}
`.trim();
}

function generateLambdaCall(lambdaCall: LambdaCall): string {
    const args = lambdaCall.lambda.args
        .map((arg: any) => `${arg}: any`)
        .join(", ");
    const argsValues = lambdaCall.args.map(generateExpression).join(", ");
    const body = generateExpression(lambdaCall.lambda.body);
    return `
(function(${args}) {
    return ${body};
})(${argsValues})
`.trim();
}

function generateEquality(equality: Equality): string {
    const left = generateExpression(equality.leftHand);
    const right = generateExpression(equality.rightHand);
    return `${left} === ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left = generateExpression(inEquality.leftHand);
    const right = generateExpression(inEquality.rightHand);
    return `${left} !== ${right}`;
}

function generateLessThan(lessThan: LessThan): string {
    const left = generateExpression(lessThan.leftHand);
    const right = generateExpression(lessThan.rightHand);
    return `${left} < ${right}`;
}

function generateLessThanOrEqual(lessThanOrEqual: LessThanOrEqual): string {
    const left = generateExpression(lessThanOrEqual.leftHand);
    const right = generateExpression(lessThanOrEqual.rightHand);
    return `${left} <= ${right}`;
}

function generateGreaterThan(greaterThan: GreaterThan): string {
    const left = generateExpression(greaterThan.leftHand);
    const right = generateExpression(greaterThan.rightHand);
    return `${left} > ${right}`;
}

function generateGreaterThanOrEqual(
    greaterThanOrEqual: GreaterThanOrEqual
): string {
    const left = generateExpression(greaterThanOrEqual.leftHand);
    const right = generateExpression(greaterThanOrEqual.rightHand);
    return `${left} >= ${right}`;
}

function generateAnd(and: And): string {
    const left = generateExpression(and.left);
    const right = generateExpression(and.right);
    return `${left} && ${right}`;
}

function generateOr(or: Or): string {
    const left = generateExpression(or.left);
    const right = generateExpression(or.right);
    return `${left} || ${right}`;
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
        case "ListRange":
            return generateListRange(expression);
        case "ObjectLiteral":
            return generateObjectLiteral(expression);
        case "IfStatement":
            return generateIfStatement(expression);
        case "CaseStatement":
            return generateCaseStatement(expression);
        case "Addition":
            return generateAddition(expression);
        case "Subtraction":
            return generateSubtraction(expression);
        case "Multiplication":
            return generateMultiplication(expression);
        case "Division":
            return generateDivision(expression);
        case "And":
            return generateAnd(expression);
        case "Or":
            return generateOr(expression);
        case "LeftPipe":
            return generateLeftPipe(expression);
        case "RightPipe":
            return generateRightPipe(expression);
        case "ModuleReference":
            return generateModuleReference(expression);
        case "FunctionCall":
            return generateFunctionCall(expression);
        case "Lambda":
            return generateLambda(expression);
        case "LambdaCall":
            return generateLambdaCall(expression);
        case "Constructor":
            return generateConstructor(expression);
        case "Equality":
            return generateEquality(expression);
        case "InEquality":
            return generateInEquality(expression);
        case "LessThan":
            return generateLessThan(expression);
        case "LessThanOrEqual":
            return generateLessThanOrEqual(expression);
        case "GreaterThan":
            return generateGreaterThan(expression);
        case "GreaterThanOrEqual":
            return generateGreaterThanOrEqual(expression);
    }
}

function collectTypeArguments(type_: Type): string[] {
    switch (type_.kind) {
        case "GenericType":
            if (isBuiltinType(type_.name)) return [ ];
            return [ type_.name ];
        case "FixedType": {
            if (isBuiltinType(type_.name)) {
                return [ ];
            }
        }
        case "FunctionType": {
            const args: string[][] = type_.args.map(collectTypeArguments);
            return ([ ] as string[]).concat(...args);
        }
    }
}

function generateFunction(function_: Function): string {
    const functionArguments = function_.args
        .map((arg) => {
            switch (arg.kind) {
                case "FunctionArg":
                    return arg.name + ": " + generateType(arg.type);
                case "AnonFunctionArg":
                    return "_" + arg.index + ": " + generateType(arg.type);
            }
        })
        .join(", ");

    const maybeLetBody =
        function_.letBody.length > 0
            ? "\n" +
              prefixLines(function_.letBody.map(generateBlock).join("\n"), 4)
            : "";

    const returnType = generateTopLevelType(function_.returnType);
    const isSimpleBody = isSimpleValue(function_.body.kind);

    const bodyPrefix = isSimpleBody ? "return " : "";
    const bodySuffix = isSimpleBody ? ";" : "";
    const body = bodyPrefix + generateExpression(function_.body) + bodySuffix;

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
function ${function_.name}${typeArgumentsString}(${functionArguments}): ${returnType} {${maybeLetBody}
${prefixedBody}
}`.trim();
}

function generateConst(constDef: Const): string {
    const body = generateExpression(constDef.value);
    const typeDef = generateTopLevelType(constDef.type);
    return `
const ${constDef.name}: ${typeDef} = ${body};
`.trim();
}

function generateImportBlock(imports: Import): string {
    return imports.modules
        .map((module) => {
            if (module.namespace === "Relative") {
                const withoutQuotes = module.name.slice(1, -1);
                const name =
                    module.alias.kind === "just"
                        ? module.alias.value
                        : path.parse(withoutQuotes).name;

                if (module.exposing.length === 0) {
                    return `import * as ${name} from ${module.name};`;
                } else {
                    return `import { ${module.exposing.join(", ")} } from ${
                        module.name
                    };`;
                }
            }
            const name =
                module.alias.kind === "just" ? module.alias.value : module.name;

            if (module.exposing.length === 0) {
                return `import * as ${name} from "${module.name}";`;
            } else {
                return `import { ${module.exposing.join(", ")} } from "${
                    module.name
                }";`;
            }
        })
        .join("\n");
}

function generateExportBlock(exports: Export): string {
    return exports.names
        .map((name) => {
            return `export { ${name} };`;
        })
        .join("\n");
}

function generateBlock(syntax: Block): string {
    switch (syntax.kind) {
        case "Import":
            return generateImportBlock(syntax);
        case "Export":
            return generateExportBlock(syntax);
        case "UnionType":
            return generateUnionType(syntax);
        case "TypeAlias":
            return generateTypeAlias(syntax);
        case "Function":
            return generateFunction(syntax);
        case "Const":
            return generateConst(syntax);
        case "Comment":
        case "MultilineComment":
            return "";
    }
}

export function generateTypescript(module: Module): string {
    return module.body
        .map(generateBlock)
        .filter((line) => line.length > 0)
        .join("\n\n");
}
