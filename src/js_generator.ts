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
    RightPipe,
    StringValue,
    Subtraction,
    TypeAlias,
    UnionType,
    Value,
} from "./types";
import { getNameFromPath } from "./utils";

function prefixLines(body: string, indent: number): string {
    return body
        .split("\n")
        .map((line) => " ".repeat(indent) + line)
        .join("\n");
}

function generateUnionType(syntax: UnionType): string {
    const tagCreators = syntax.tags
        .map((tag) => {
            const generatedType = tag.name;

            return `
function ${generatedType}(args) {
    return {
        kind: "${tag.name}",
        ...args,
    };
}
`.trim();
        })
        .join("\n\n");

    return tagCreators;
}

function generateValue(value: Value): string {
    return value.body;
}

function generateField(field: Field): string {
    const value = generateExpression(field.value);

    if (field.name === value) {
        return `${field.name}`;
    }

    return `${field.name}: ${value}`;
}

function generateObjectLiteralWithBase(literal: ObjectLiteral): string {
    const base = (literal.base as Value).body;
    if (literal.fields.length === 0) return `{ ${base} }`;

    let fields = literal.fields.map(generateField).join(",\n    ");

    if (literal.fields.length === 1) return `{ ${base}, ${fields} }`;

    return `{
    ${base},
    ${fields}
}`;
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    if (literal.base !== null) return generateObjectLiteralWithBase(literal);
    if (literal.fields.length === 0) return `{ }`;

    let fields = literal.fields.map(generateField).join(",\n    ");

    if (literal.fields.length === 1) return `{ ${fields} }`;

    return `{
    ${fields}
}`;
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
    const maybeLetBody =
        branch.letBody.length > 0
            ? "\n" +
              prefixLines(branch.letBody.map(generateBlock).join("\n"), 4)
            : "";

    switch (branch.pattern.kind) {
        case "Destructure": {
            const pattern =
                branch.pattern.pattern.trim().length > 0
                    ? `\n    const ${branch.pattern.pattern} = ${predicate};`
                    : "";
            return `case "${branch.pattern.constructor}": {${pattern}${maybeLetBody}
    ${returnWrapper}${body};
}`;
        }
        case "StringValue": {
            return `case "${branch.pattern.body}": {${maybeLetBody}
    ${returnWrapper}${body};
}`;
        }
        case "Default": {
            return `default: {${maybeLetBody}
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
    const args = lambda.args.join(", ");
    const body = generateExpression(lambda.body);
    return `
function(${args}) {
    return ${body};
}
`.trim();
}

function generateLambdaCall(lambdaCall: LambdaCall): string {
    const args = lambdaCall.lambda.args.join(", ");
    const argsValues = lambdaCall.args.map(generateExpression).join(", ");
    const body = generateExpression(lambdaCall.lambda.body);
    return `
(function(${args}) {
    return ${body};
})(${argsValues})
`.trim();
}

function generateEquality(equality: Equality): string {
    const left = generateExpression(equality.left);
    const right = generateExpression(equality.right);
    return `${left} === ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left = generateExpression(inEquality.left);
    const right = generateExpression(inEquality.right);
    return `${left} !== ${right}`;
}

function generateLessThan(lessThan: LessThan): string {
    const left = generateExpression(lessThan.left);
    const right = generateExpression(lessThan.right);
    return `${left} < ${right}`;
}

function generateLessThanOrEqual(lessThanOrEqual: LessThanOrEqual): string {
    const left = generateExpression(lessThanOrEqual.left);
    const right = generateExpression(lessThanOrEqual.right);
    return `${left} <= ${right}`;
}

function generateGreaterThan(greaterThan: GreaterThan): string {
    const left = generateExpression(greaterThan.left);
    const right = generateExpression(greaterThan.right);
    return `${left} > ${right}`;
}

function generateGreaterThanOrEqual(
    greaterThanOrEqual: GreaterThanOrEqual
): string {
    const left = generateExpression(greaterThanOrEqual.left);
    const right = generateExpression(greaterThanOrEqual.right);
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

function generateFunction(function_: Function): string {
    const functionArguments = function_.args
        .map((arg) => {
            switch (arg.kind) {
                case "FunctionArg":
                    return arg.name;
                case "AnonFunctionArg":
                    return "_" + arg.index;
            }
        })
        .join(", ");

    const isSimpleBody = isSimpleValue(function_.body.kind);
    const maybeLetBody =
        function_.letBody.length > 0
            ? "\n" +
              prefixLines(function_.letBody.map(generateBlock).join("\n"), 4)
            : "";

    const bodyPrefix = isSimpleBody ? "return " : "";
    const bodySuffix = isSimpleBody ? ";" : "";
    const body = bodyPrefix + generateExpression(function_.body) + bodySuffix;

    const prefixedBody = prefixLines(body, 4);

    return `
function ${function_.name}(${functionArguments}) {${maybeLetBody}
${prefixedBody}
}`.trim();
}

function generateInlineIf(expression: IfStatement): string {
    const ifBody =
        expression.ifBody.kind === "IfStatement"
            ? "( " + generateInlineIf(expression.ifBody) + " )"
            : generateExpression(expression.ifBody);

    const elseBody =
        expression.elseBody.kind === "IfStatement"
            ? "( " + generateInlineIf(expression.elseBody) + " )"
            : generateExpression(expression.elseBody);

    return `${generateExpression(
        expression.predicate
    )} ? ${ifBody} : ${elseBody}`;
}

function generateInlineCase(expression: CaseStatement): string {
    return `(function () {
${prefixLines(generateExpression(expression), 4)}
})()`;
}

function generateConst(constDef: Const): string {
    let body = "";

    switch (constDef.value.kind) {
        case "IfStatement": {
            body = generateInlineIf(constDef.value);
            break;
        }
        case "CaseStatement": {
            body = generateInlineCase(constDef.value);
            break;
        }
        default: {
            body = generateExpression(constDef.value);
            break;
        }
    }

    return `
const ${constDef.name} = ${body};
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
                        : getNameFromPath(withoutQuotes);

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

function generateTypeAlias(syntax: TypeAlias): string {
    const type = syntax.type.name;
    return `
function ${type}(args) {
    return {
        ...args,
    };
}
    `.trim();
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

export function generateJavascript(module: Module): string {
    return module.body
        .map(generateBlock)
        .filter((line) => line.length > 0)
        .join("\n\n");
}
