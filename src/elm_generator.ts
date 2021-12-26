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

            return (
                generateType(
                    FixedType(
                        tag.name,
                        tag.args.map((arg) => arg.type)
                    )
                ) + funcDefArgsStr
            );
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
        return `${field.name} = ${value}`;
    }

    return `${field.name} = ${value}`;
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    let fields = literal.fields.map(generateField).join(",\n    ");

    if (literal.fields.length === 1) return `{ ${fields} }`;

    return `{
    ${fields}
}`;
}

function generateValue(value: Value): string {
    if (value.body === `true`) return "True";
    if (value.body === "false") return "False";

    return value.body;
}

function generateStringValue(string: StringValue): string {
    return `"${string.body}"`;
}

// TODO: properly convert string interpolation
function generateFormatStringValue(string: FormatStringValue): string {
    return `"${string.body}"`;
}

function generateListValue(list: ListValue): string {
    if (list.items.length === 0) return `[ ]`;
    return `[
${prefixLines(list.items.map(generateExpression).join(",\n"), 4)}
]`;
}

function generateListRange(list: ListRange): string {
    return `[ ${list.start.body}..${list.end.body} ]`;
}

function generateIfStatement(ifStatement: IfStatement): string {
    return `if ${generateExpression(ifStatement.predicate)} then
${prefixLines(generateExpression(ifStatement.ifBody), 4)}
else
${prefixLines(generateExpression(ifStatement.elseBody), 4)}
`;
}

function generateConstructor(constructor: Constructor): string {
    return `${constructor.constructor} ${generateObjectLiteral(
        constructor.pattern
    )}`;
}

function generateBranch(branch: Branch): string {
    const pattern = branch.pattern.pattern ? ` ${branch.pattern.pattern}` : "";
    return `${branch.pattern.constructor}${pattern} ->
    ${generateExpression(branch.body)}
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

const typeMap: Record<string, string> = {
    boolean: "Bool",
    number: "Float",
    string: "String",
    void: "String",
};

function typeMapNameLookup(name: string): string {
    if (Object.keys(typeMap).indexOf(name) === -1) {
        return name;
    }

    return typeMap[name];
}

function generateType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            return typeMapNameLookup(type_.name);
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
                return typeMapNameLookup(type_.name);
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

    if (
        addition.left.kind === "StringValue" ||
        addition.right.kind === "StringValue"
    ) {
        return `${left} ++ ${right}`;
    }

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

const moduleLookup: Record<string, string> = {
    "console.log": `Debug.log ""`,
};

function generateModuleReference(moduleReference: ModuleReference): string {
    const left = moduleReference.path.join(".");
    const right = generateExpression(moduleReference.value);
    const value = `${left}.${right}`;

    if (Object.keys(moduleLookup).indexOf(value) === -1) {
        return value;
    }
    return moduleLookup[value];
}

function generateFunctionCall(functionCall: FunctionCall): string {
    if (functionCall.args.length === 0) return `${functionCall.name}`;
    const right = functionCall.args.map(generateExpression).join(" ");

    return `${functionCall.name} ${right}`;
}

function generateLambda(lambda: Lambda): string {
    const args = lambda.args.map((arg: any) => `${arg}`).join(" ");
    const body = generateExpression(lambda.body);
    return `
\\${args} -> ${body}
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
    return `${left} == ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left = generateExpression(inEquality.leftHand);
    const right = generateExpression(inEquality.rightHand);
    return `${left} != ${right}`;
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

    const returnType = generateType(function_.returnType);
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
    const typeDef = generateType(constDef.type);
    return `
${constDef.name}: ${typeDef}
${constDef.name} =
${body}
`.trim();
}

function generateImportBlock(imports: Import): string {
    return imports.modules
        .map((module) => {
            const moduleName =
                module.namespace === "Global"
                    ? module.name
                    : module.name
                          .replace("./", "")
                          .split("/")
                          .join(".")
                          .split(`"`)
                          .join("");

            if (module.alias.kind === "just")
                return `import ${moduleName} as ${module.alias.value}`;

            if (module.exposing.length > 0)
                return `import ${moduleName} exposing ( ${module.exposing.join(
                    ", "
                )} )`;
            return `import ${moduleName}`;
        })
        .join("\n");
}

function generateExportBlock(moduleName: string, names: string[]): string {
    moduleName = moduleName.toUpperCase()[0] + moduleName.slice(1);

    if (names.length === 0) return `module ${moduleName} exposing (..)`;

    return `module ${moduleName} exposing (${names.join(", ")})`;
}

function generateBlock(syntax: Block): string {
    switch (syntax.kind) {
        case "Import":
            return generateImportBlock(syntax);
        case "Export":
            return "";
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

export function generateElm(module: Module): string {
    const exports: string[] = [ ];
    module.body
        .filter((block) => block.kind === "Export")
        .forEach((block) => exports.push(...(block as Export).names));

    return [
        generateExportBlock(module.name, exports),
        ...module.body.map(generateBlock),
    ]
        .filter((line) => line.trim().length > 0)
        .join("\n\n");
}
