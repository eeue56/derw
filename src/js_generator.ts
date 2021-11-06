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
    Subtraction,
    isSimpleValue,
    Multiplication,
    Division,
    LeftPipe,
    ModuleReference,
    FunctionCall,
    RightPipe,
    Lambda,
    Import,
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
        case "Subtraction":
            return generateSubtraction(expression);
        case "Multiplication":
            return generateMultiplication(expression);
        case "Division":
            return generateDivision(expression);
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

    const bodyPrefix = isSimpleBody ? "return " : "";
    const bodySuffix = isSimpleBody ? ";" : "";
    const body = bodyPrefix + generateExpression(function_.body) + bodySuffix;

    const prefixedBody = prefixLines(body, 4);

    return `
function ${function_.name}(${functionArguments}) {
${prefixedBody}
}`.trim();
}

function generateConst(constDef: Const): string {
    const body = generateExpression(constDef.value);
    return `
const ${constDef.name} = ${body};
`.trim();
}

function generateImportBlock(imports: Import): string {
    return imports.moduleNames
        .map((moduleName) => {
            return `import ${moduleName} from "${moduleName}";`;
        })
        .join("\n");
}

function generateBlock(syntax: Block): string {
    switch (syntax.kind) {
        case "Import":
            return generateImportBlock(syntax);
        case "UnionType":
            return generateUnionType(syntax);
        case "Function":
            return generateFunction(syntax);
        case "Const":
            return generateConst(syntax);
    }
}

export function generateJavascript(module: Module): string {
    return module.body.map(generateBlock).join("\n\n");
}
