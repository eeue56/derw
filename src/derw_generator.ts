import {
    Addition,
    And,
    Block,
    Branch,
    BranchPattern,
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
    Lambda,
    LambdaCall,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListDestructurePart,
    ListPrepend,
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
        .map((line) => (line.trim() === "" ? "" : " ".repeat(indent) + line))
        .join("\n");
}

function generateUnionType(syntax: UnionType): string {
    const tags = syntax.tags
        .map((tag) => {
            const typeDefArgs = tag.args
                .map((arg) => arg.name + ": " + generateType(arg.type) + "")
                .join(",\n    ");

            const funcDefArgsStr =
                tag.args.length > 0 ? ` { ${typeDefArgs} }` : "";

            return generateType(FixedType(tag.name, [ ])) + funcDefArgsStr;
        })
        .join("\n| ");

    return `
type ${generateType(syntax.type)} =
${prefixLines(tags, 4)}
`.trim();
}

function generateProperty(syntax: Property): string {
    return `${syntax.name}: ${generateType(syntax.type)}`;
}

function generateTypeAlias(syntax: TypeAlias): string {
    const generatedProperties = syntax.properties.map(generateProperty);
    const properties = generatedProperties.join(",\n    ");
    const type = generateType(syntax.type);

    return `
type alias ${type} = {
    ${properties}
}
`.trim();
}

function generateField(field: Field): string {
    const value = generateExpression(field.value);

    if (field.name === value) {
        return `${field.name}: ${value}`;
    }

    return `${field.name}: ${value}`;
}

function generateObjectLiteralWithBase(literal: ObjectLiteral): string {
    const base = (literal.base as Value).body;
    let fields = literal.fields.map(generateField).join(",\n    ");

    if (literal.fields.length === 1) return `{ ${base}, ${fields} }`;

    return `{
    ${base},
    ${fields}
}`;
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    if (literal.base) return generateObjectLiteralWithBase(literal);
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
    return `[
${prefixLines(list.items.map(generateExpression).join(",\n"), 4)}
]`;
}

function generateListRange(list: ListRange): string {
    return `[ ${list.start.body}..${list.end.body} ]`;
}

function generateIfStatement(ifStatement: IfStatement): string {
    const maybeIfLetBody =
        ifStatement.ifLetBody.length > 0
            ? prefixLines("\nlet", 4) +
              "\n" +
              prefixLines(
                  ifStatement.ifLetBody.map(generateBlock).join("\n\n"),
                  8
              ) +
              prefixLines("\nin", 4) +
              prefixLines("", 8)
            : "";

    const maybeElseLetBody =
        ifStatement.elseLetBody.length > 0
            ? prefixLines("\nlet", 4) +
              "\n" +
              prefixLines(
                  ifStatement.elseLetBody.map(generateBlock).join("\n\n"),
                  8
              ) +
              prefixLines("\nin", 4) +
              prefixLines("", 8)
            : "";

    return `if ${generateExpression(
        ifStatement.predicate
    )} then${maybeIfLetBody}
${prefixLines(generateExpression(ifStatement.ifBody), maybeIfLetBody ? 8 : 4)}
else${maybeElseLetBody}
${prefixLines(
    generateExpression(ifStatement.elseBody),
    maybeElseLetBody ? 8 : 4
)}
`;
}

function generateConstructor(constructor: Constructor): string {
    if (constructor.pattern.fields.length === 0)
        return `${constructor.constructor}`;
    return `${constructor.constructor} ${generateObjectLiteral(
        constructor.pattern
    )}`;
}

function generateListDestructurePart(part: ListDestructurePart): string {
    switch (part.kind) {
        case "EmptyList": {
            return "[]";
        }
        case "StringValue": {
            return `"` + part.body + `"`;
        }
        case "FormatStringValue": {
            return "`" + part.body + "`";
        }
        case "Value": {
            return part.body;
        }
    }
}

function generateBranchPattern(branchPattern: BranchPattern): string {
    switch (branchPattern.kind) {
        case "Destructure": {
            const pattern = branchPattern.pattern
                ? ` ${branchPattern.pattern}`
                : "";
            return `${branchPattern.constructor}${pattern}`;
        }
        case "StringValue": {
            return `"` + branchPattern.body + `"`;
        }
        case "FormatStringValue": {
            return "`" + branchPattern.body + "`";
        }
        case "EmptyList": {
            return "[]";
        }
        case "ListDestructure": {
            return branchPattern.parts
                .map(generateListDestructurePart)
                .join(" :: ");
        }
        case "Default": {
            return "default";
        }
    }
}

function generateBranch(branch: Branch): string {
    const maybeLetBody =
        branch.letBody.length > 0
            ? prefixLines("\nlet", 4) +
              "\n" +
              prefixLines(branch.letBody.map(generateBlock).join("\n\n"), 8) +
              prefixLines("\nin", 4) +
              prefixLines("", 8)
            : "";

    const body = prefixLines(
        generateExpression(branch.body),
        branch.letBody.length === 0 ? 4 : 8
    );

    return `${generateBranchPattern(branch.pattern)} ->${maybeLetBody}
${body}
`.trim();
}

function generateCaseStatement(caseStatement: CaseStatement): string {
    const predicate = generateExpression(caseStatement.predicate);
    const branches = caseStatement.branches.map((branch) =>
        generateBranch(branch)
    );

    return `case ${predicate} of
${prefixLines(branches.join("\n"), 4)}
`.trim();
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

            return `${type_.name} ${args.map(generateType).join(" ")}`;
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
                    return "List " + generateType(type_.args[0]);
                }

                const fixedArgs = type_.args.filter(
                    (type_) => type_.kind === "FixedType"
                );

                if (fixedArgs.length === 0) {
                    return "List any";
                } else if (fixedArgs.length === 1) {
                    return `List ${generateType(fixedArgs[0])}`;
                }

                return `List (${fixedArgs.map(generateType).join(" | ")})`;
            }

            const args = type_.args.filter(
                (type_) => type_.kind === "GenericType"
            );
            if (args.length === 0) {
                return type_.name;
            }

            return `${type_.name} ${args.map(generateType).join(" ")}`;
        }
        case "FunctionType": {
            return "(" + type_.args.map(generateType).join(" -> ") + ")";
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

function generateLeftPipe(leftPipe: LeftPipe): string {
    const left = generateExpression(leftPipe.left);
    const right = generateExpression(leftPipe.right);

    return `${left}
    |> ${right}`;
}

function generateRightPipe(rightPipe: RightPipe): string {
    const left = generateExpression(rightPipe.left);
    const right = generateExpression(rightPipe.right);

    return `${left}
    <| ${right}`;
}

function generateModuleReference(moduleReference: ModuleReference): string {
    const left = moduleReference.path.join(".");
    const right = generateExpression(moduleReference.value);

    return `${left}.${right}`;
}

function generateFunctionCall(functionCall: FunctionCall): string {
    if (functionCall.args.length === 0) return `${functionCall.name}()`;

    let output: string[] = [ ];

    for (const arg of functionCall.args) {
        switch (arg.kind) {
            case "Constructor":
            case "FunctionCall": {
                output.push("(" + generateExpression(arg) + ")");
                break;
            }
            case "ModuleReference": {
                switch (arg.value.kind) {
                    case "Constructor":
                    case "FunctionCall": {
                        output.push("(" + generateExpression(arg) + ")");
                        break;
                    }
                    default: {
                        output.push(generateExpression(arg));
                        break;
                    }
                }
                break;
            }
            default: {
                output.push(generateExpression(arg));
            }
        }
    }
    const right = output.join(" ");

    return `${functionCall.name} ${right}`;
}

function generateLambda(lambda: Lambda): string {
    const args = lambda.args.map((arg: any) => `${arg}`).join(" ");
    const body = generateExpression(lambda.body);
    return `
(\\${args} -> ${body})
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
    const left = generateExpression(equality.left);
    const right = generateExpression(equality.right);
    return `${left} == ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left = generateExpression(inEquality.left);
    const right = generateExpression(inEquality.right);
    return `${left} != ${right}`;
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

function generateListPrepend(prepend: ListPrepend): string {
    const left = generateExpression(prepend.left);
    const right = generateExpression(prepend.right);
    return `${left} :: ${right}`;
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
        case "ListPrepend":
            return generateListPrepend(expression);
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
    const functionArgumentsTypes = function_.args
        .map((arg) => {
            switch (arg.kind) {
                case "FunctionArg":
                    return generateType(arg.type);
                case "AnonFunctionArg":
                    return generateType(arg.type);
            }
        })
        .join(" -> ");

    const functionArguments = function_.args
        .map((arg) => {
            switch (arg.kind) {
                case "FunctionArg":
                    return arg.name;
                case "AnonFunctionArg":
                    return "_" + arg.index;
            }
        })
        .join(" ");

    const maybeLetBody =
        function_.letBody.length > 0
            ? prefixLines("\nlet", 4) +
              "\n" +
              prefixLines(
                  function_.letBody.map(generateBlock).join("\n\n"),
                  8
              ) +
              prefixLines("\nin", 4)
            : "";

    const returnType = generateTopLevelType(function_.returnType);
    const body = generateExpression(function_.body);

    const prefixedBody = prefixLines(body, maybeLetBody === "" ? 4 : 8);

    return `
${function_.name}: ${functionArgumentsTypes} -> ${returnType}
${function_.name} ${functionArguments} =${maybeLetBody}
${prefixedBody}
`.trim();
}

function generateConst(constDef: Const): string {
    const body = prefixLines(generateExpression(constDef.value), 4);
    const typeDef = generateTopLevelType(constDef.type);
    return `
${constDef.name}: ${typeDef}
${constDef.name} =
${body}
`.trim();
}

function generateImportBlock(imports: Import): string {
    return imports.modules
        .map((module) => {
            if (module.alias.kind === "just")
                return `import ${module.name} as ${module.alias.value}`;

            if (module.exposing.length > 0)
                return `import ${module.name} exposing ( ${module.exposing.join(
                    ", "
                )} )`;
            return `import ${module.name}`;
        })
        .join("\n");
}

function generateExportBlock(exports: Export): string {
    return `exposing (${exports.names.join(", ")})`;
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

export function generateDerw(module: Module): string {
    return module.body
        .map(generateBlock)
        .filter((line) => line.length > 0)
        .join("\n\n");
}
