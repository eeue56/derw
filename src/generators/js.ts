import { exportTests } from "../Blocks";
import {
    Addition,
    And,
    Block,
    Branch,
    CaseStatement,
    Const,
    Constructor,
    Destructure,
    Division,
    DoBlock,
    Equality,
    Expression,
    Field,
    FormatStringValue,
    Function,
    FunctionCall,
    GreaterThan,
    GreaterThanOrEqual,
    IfStatement,
    InEquality,
    isSimpleValue,
    Lambda,
    LambdaCall,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListDestructure,
    ListPrepend,
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
} from "../types";
import { hashCode } from "../utils";
import {
    destructureLength,
    patternGapPositions,
    patternHasGaps,
    prefixLines,
} from "./Common";
import {
    flattenLeftPipe,
    generateExportBlock,
    generateFormatStringValue,
    generateImportBlock,
    generateListDestructurePart,
    generateListRange,
    generateStringValue,
    generateValue,
} from "./common_to_ecma";

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

function generateListValue(list: ListValue): string {
    if (list.items.length === 0) return `[ ]`;
    if (list.items.length === 1)
        return `[ ${generateExpression(list.items[0])} ]`;
    return `[ ${list.items.map(generateExpression).join(", ")} ]`;
}

function generateIfStatement(ifStatement: IfStatement): string {
    const isSimpleIfBody = isSimpleValue(ifStatement.ifBody.kind);
    const isSimpleElseBody = isSimpleValue(ifStatement.elseBody.kind);

    const ifBodyPrefix = isSimpleIfBody ? "return " : "";
    const elseBodyPrefix = isSimpleElseBody ? "return " : "";

    const maybeIfLetBody =
        ifStatement.ifLetBody.length > 0
            ? "\n" +
              prefixLines(
                  ifStatement.ifLetBody
                      .map((block) => generateBlock(block))
                      .join("\n"),
                  4
              )
            : "";

    const ifBody = generateExpression(ifStatement.ifBody);
    const indentedIfBody =
        ifBody.split("\n").length === 1
            ? ifBody
            : [
                  ifBody.split("\n")[0],
                  prefixLines(ifBody.split("\n").slice(1).join("\n"), 4),
              ].join("\n");

    const maybeElseLetBody =
        ifStatement.elseLetBody.length > 0
            ? "\n" +
              prefixLines(
                  ifStatement.elseLetBody
                      .map((block) => generateBlock(block))
                      .join("\n"),
                  4
              )
            : "";

    const elseBody = generateExpression(ifStatement.elseBody);
    const indentedElseBody =
        elseBody.split("\n").length === 1
            ? elseBody
            : [
                  elseBody.split("\n")[0],
                  prefixLines(elseBody.split("\n").slice(1).join("\n"), 4),
              ].join("\n");

    return `if (${generateExpression(ifStatement.predicate)}) {${maybeIfLetBody}
    ${ifBodyPrefix}${indentedIfBody};
} else {${maybeElseLetBody}
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

/*

Takes something like Speech :: middle :: Speech :: rest

*/
function generateListDestructureWithGaps(
    predicate: string,
    branch: Branch,
    pattern: ListDestructure
): string {
    const isFinalEmptyList =
        pattern.parts[pattern.parts.length - 1].kind === "EmptyList";

    const partsWithLength = destructureLength(pattern);

    let output = "";
    const REPLACE_KEY = "$REPLACE_ME";
    let indent = 0;

    for (let i = 0; i < pattern.parts.length; i++) {
        const part = pattern.parts[i];
        const isLastValue = i === pattern.parts.length - 1;

        switch (part.kind) {
            case "Destructure": {
                const isNextAValue = isLastValue
                    ? false
                    : pattern.parts[i + 1].kind === "Value";
                const hasADestructureAfter =
                    i < pattern.parts.length - 2
                        ? pattern.parts[i + 2].kind === "Destructure"
                        : false;
                if (isNextAValue && hasADestructureAfter) {
                    const nextValue = pattern.parts[i + 1] as Value;
                    const destructorAfter = pattern.parts[i + 2] as Destructure;
                    output += prefixLines(
                        `
const [ _0, ..._rest ] = ${predicate};
if (_0.kind === "${part.constructor}") {
    let _foundIndex = -1;
    for (let _i = 0; _i < _rest.length; _i++) {
        if (_rest[_i].kind === "${destructorAfter.constructor}") {
            _foundIndex = _i;
            break;
        }
    }

    if (_foundIndex > -1) {
        const ${nextValue.body} = _rest.slice(0, _foundIndex);
        ${REPLACE_KEY}
    }
}`,
                        8
                    ).trim();
                    i += 1;
                }
                break;
            }
            case "Value": {
                if (output.length > 0) {
                    if (pattern.parts[i - 1].kind === "Destructure") {
                        output = output.replace(
                            REPLACE_KEY,
                            `const ${part.body} = _rest.slice(_foundIndex, _rest.length);
${REPLACE_KEY}
    `.trim()
                        );
                    } else {
                        output = output.replace(
                            REPLACE_KEY,
                            `const ${part.body} = _rest;
${REPLACE_KEY}
    `.trim()
                        );
                    }
                } else {
                    output += `
const ${part.body} = _rest;
                    `;
                }
                break;
            }
        }
        i++;
    }

    const conditional = isFinalEmptyList
        ? `${predicate}.length === ${partsWithLength}`
        : `${predicate}.length >= ${partsWithLength}`;

    const returnWrapper = isSimpleValue(branch.body.kind) ? "    return " : "";
    const body = prefixLines(
        generateExpression(branch.body),
        isSimpleValue(branch.body.kind) ? 0 : 4
    );

    const inner = prefixLines(`${returnWrapper}${body};`, 12);

    return `
case ${predicate}.length: {
    if (${conditional}) {
        ${output.replace(REPLACE_KEY, inner)}
    }
}`.trim();
}

function generateBranch(predicate: string, branch: Branch): string {
    const returnWrapper = isSimpleValue(branch.body.kind) ? "    return " : "";
    const body = prefixLines(
        generateExpression(branch.body),
        isSimpleValue(branch.body.kind) ? 0 : 4
    );
    const maybeLetBody =
        branch.letBody.length > 0
            ? "\n" +
              prefixLines(
                  branch.letBody
                      .map((block) => generateBlock(block))
                      .join("\n"),
                  4
              )
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
        case "FormatStringValue": {
            return `case \`${branch.pattern.body}\`: {${maybeLetBody}
${returnWrapper}${body};
}`;
        }
        case "EmptyList": {
            return `case 0: {${maybeLetBody}
${returnWrapper}${body};
}`;
        }
        case "ListDestructure": {
            const length = branch.pattern.parts.length;
            const isFinalEmptyList =
                branch.pattern.parts[length - 1].kind === "EmptyList";

            const partsWithLength = destructureLength(branch.pattern);
            const hasGaps = patternHasGaps(branch.pattern);
            const gapPositions = patternGapPositions(branch.pattern);
            const isOnlyFinalGap =
                gapPositions.length === 1 &&
                gapPositions[0] === branch.pattern.parts.length - 1;

            const conditional =
                isFinalEmptyList && !hasGaps
                    ? `${predicate}.length === ${partsWithLength}`
                    : `${predicate}.length >= ${partsWithLength}`;

            const firstPart = branch.pattern.parts[0];

            const isFirstDestructor = firstPart.kind === "Destructure";

            if (hasGaps && !isOnlyFinalGap) {
                return generateListDestructureWithGaps(
                    predicate,
                    branch,
                    branch.pattern
                );
            } else if (isFirstDestructor) {
                const destructors = branch.pattern.parts.filter(
                    (t) => t.kind === "Destructure"
                ) as Destructure[];

                const destructorParts = destructors.map((_, i) => `_${i}`);

                const generatedParts = [
                    ...destructorParts,
                    ...branch.pattern.parts
                        .slice(destructorParts.length, -1)
                        .map(generateListDestructurePart),
                ];

                const parts = isFinalEmptyList
                    ? generatedParts.join(", ")
                    : generatedParts.join(", ") +
                      ", ..." +
                      generateListDestructurePart(
                          branch.pattern.parts[length - 1]
                      );

                const conditionals = destructors.map((destructor, i) => {
                    return `_${i}.kind === "${destructor.constructor}"`;
                });

                const joinedConditionals = conditionals.join(" && ");

                const unpacked = destructors.map((destructor, i) => {
                    return destructor.pattern.length > 0
                        ? `\n            const ${destructor.pattern} = _${i};`
                        : "";
                });

                const joinedUnpacked =
                    unpacked.length === 0 ? "" : unpacked.join("");

                return `case ${predicate}.length: {
    if (${conditional}) {
        const [ ${parts} ] = ${predicate};
        if (${joinedConditionals}) {${joinedUnpacked}${
                    maybeLetBody ? prefixLines(maybeLetBody, 8) : ""
                }
        ${returnWrapper}${body};
        }
    }
}`;
            }
            const isFirstValue =
                firstPart.kind === "StringValue" ||
                firstPart.kind === "FormatStringValue";

            const partsToGenerate = isFirstValue
                ? [ Value("_temp"), ...branch.pattern.parts.slice(1, -1) ]
                : branch.pattern.parts.slice(0, -1);

            const generatedParts = partsToGenerate.map(
                generateListDestructurePart
            );

            const parts = isFinalEmptyList
                ? generatedParts.join(", ")
                : generatedParts.join(", ") +
                  ", ..." +
                  generateListDestructurePart(branch.pattern.parts[length - 1]);

            if (isFirstValue) {
                const typeCheckedFirstPart = firstPart as
                    | StringValue
                    | FormatStringValue;
                const tempConditional =
                    typeCheckedFirstPart.kind === "StringValue"
                        ? `"${typeCheckedFirstPart.body}"`
                        : `\`${typeCheckedFirstPart.body}\``;
                return `case ${predicate}.length: {
    if (${conditional}) {
        const [ ${parts} ] = ${predicate};${
                    maybeLetBody ? prefixLines(maybeLetBody, 4) : ""
                }
        if (_temp === ${tempConditional}) {
        ${returnWrapper}${body};
        }
    }
}`;
            } else {
                return `case ${predicate}.length: {
    if (${conditional}) {
        const [ ${parts} ] = ${predicate};${
                    maybeLetBody ? prefixLines(maybeLetBody, 4) : ""
                }
    ${returnWrapper}${body};
    }
}`;
            }
        }
        case "Default": {
            return `default: {${maybeLetBody}
${returnWrapper}${body};
}`;
        }
    }
}

function isModuleReferenceToAValue(moduleReference: ModuleReference): boolean {
    return moduleReference.value.kind === "Value";
}

function generateCaseStatement(caseStatement: CaseStatement): string {
    const predicate = generateExpression(caseStatement.predicate);
    const isValue =
        caseStatement.predicate.kind === "Value" ||
        (caseStatement.predicate.kind === "ModuleReference" &&
            isModuleReferenceToAValue(caseStatement.predicate));
    const name = isValue ? predicate : `_res${hashCode(predicate)}`;
    const maybePredicateAssignment = isValue
        ? ""
        : `const ${name} = ${predicate};`;
    const branches = caseStatement.branches.map((branch) =>
        generateBranch(name, branch)
    );

    const isString =
        caseStatement.branches.filter(
            (branch) => branch.pattern.kind === "StringValue"
        ).length > 0;

    if (isString) {
        return `
${maybePredicateAssignment}
switch (${name}) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
    }

    const isList =
        caseStatement.branches.filter(
            (branch) =>
                branch.pattern.kind === "EmptyList" ||
                branch.pattern.kind === "ListDestructure"
        ).length > 0;

    if (isList) {
        return `
${maybePredicateAssignment}
switch (${name}.length) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
    }

    return `
${maybePredicateAssignment}
switch (${name}.kind) {
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

function generateLeftPipe(leftPipe: LeftPipe): string {
    return generateExpression(flattenLeftPipe(leftPipe));
}

function generateRightPipe(rightPipe: RightPipe): string {
    const left = generateExpression(rightPipe.left);
    const right = generateExpression(rightPipe.right);

    return `${left}(${right})`;
}

function generateModuleReference(moduleReference: ModuleReference): string {
    if (moduleReference.path.length === 0) {
        const right = generateExpression(moduleReference.value);
        return `(arg0) => arg0.${right}`;
    }

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
    const isSimple = isSimpleValue(lambda.body.kind);
    const body = prefixLines(generateExpression(lambda.body), isSimple ? 0 : 4);

    if (isSimple) {
        return `
function(${args}) {
    return ${body};
}
`.trim();
    }

    return `
function(${args}) {
${body}
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

function generateListPrepend(prepend: ListPrepend): string {
    const left = generateExpression(prepend.left);
    const right = generateExpression(prepend.right);
    return `[ ${left}, ...${right} ]`;
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

function generateDoBlock(doBody: DoBlock): string {
    const lines = [ ];

    for (const expression of doBody.expressions) {
        switch (expression.kind) {
            case "Const": {
                lines.push(generateConst(expression));
                break;
            }
            case "Function": {
                lines.push(generateFunction(expression));
                break;
            }
            case "FunctionCall": {
                lines.push(generateFunctionCall(expression) + ";");
                break;
            }
            case "ModuleReference": {
                lines.push(generateModuleReference(expression) + ";");
                break;
            }
        }
    }
    return lines.join("\n");
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
              prefixLines(
                  function_.letBody
                      .map((block) => generateBlock(block))
                      .join("\n"),
                  4
              )
            : "";

    const maybeDoBody =
        function_.doBody === null
            ? ""
            : "\n" + prefixLines(generateDoBlock(function_.doBody), 4);

    const bodyPrefix = isSimpleBody ? "return " : "";
    const bodySuffix = isSimpleBody ? ";" : "";
    const body = bodyPrefix + generateExpression(function_.body) + bodySuffix;

    const prefixedBody = prefixLines(body, 4);

    return `
function ${function_.name}(${functionArguments}) {${maybeLetBody}${maybeDoBody}
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

function generateNestedConst(constDef: Const, body: string): string {
    const generatedBlocks = constDef.letBody
        .map((block) => generateBlock(block))
        .join("\n");
    return `(function() {
${prefixLines(generatedBlocks, 4)}
    return ${body};
})()
`.trim();
}

function generateConst(constDef: Const): string {
    let body = "";

    switch (constDef.value.kind) {
        case "IfStatement": {
            if (constDef.letBody.length === 0) {
                body = generateInlineIf(constDef.value);
            } else {
                body = generateNestedConst(
                    constDef,
                    generateInlineIf(constDef.value)
                );
            }
            break;
        }
        case "CaseStatement": {
            if (constDef.letBody.length === 0) {
                body = generateInlineCase(constDef.value);
            } else {
                body = generateNestedConst(
                    constDef,
                    generateInlineCase(constDef.value)
                );
            }
            break;
        }
        default: {
            if (constDef.letBody.length === 0) {
                body = generateExpression(constDef.value);
            } else {
                body = generateNestedConst(
                    constDef,
                    generateExpression(constDef.value)
                );
            }
            break;
        }
    }

    return `
const ${constDef.name} = ${body};
`.trim();
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

function generateBlock(syntax: Block, unionTypeNames?: string[]): string {
    switch (syntax.kind) {
        case "Import":
            return generateImportBlock(syntax);
        case "Export":
            return generateExportBlock({
                ...syntax,
                names: syntax.names.filter(
                    (name) => !(unionTypeNames || [ ]).includes(name)
                ),
            });
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
    const unionTypeNames = module.body
        .filter((block) => block.kind === "UnionType")
        .map((block) => (block as UnionType).type.name);

    return [ exportTests(module), ...module.body ]
        .map((b) => generateBlock(b, unionTypeNames))
        .filter((line) => line.length > 0)
        .join("\n\n");
}
