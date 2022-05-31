import { exportTests } from "../blocks";
import { isBuiltinType } from "../builtins";
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
    FixedType,
    FormatStringValue,
    Function,
    FunctionCall,
    FunctionType,
    GenericType,
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
    ListDestructure,
    ListPrepend,
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
} from "../types";
import { hashCode } from "../utils";
import {
    destructureLength,
    patternGapPositions,
    patternHasGaps,
    prefixLines,
} from "./common";
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

function generateUnionType(syntax: UnionType, imports: Import[]): string {
    const tagCreators = syntax.tags
        .map((tag) => {
            const typeDefArgs = tag.args
                .map(
                    (arg) =>
                        arg.name + ": " + generateType(arg.type, imports) + ";"
                )
                .join("\n    ");

            const funcDefArgs = tag.args
                .map((arg) => arg.name + ": " + generateType(arg.type, imports))
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
                ),
                imports
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
                ),
                imports
            );
        })
        .join(" | ");

    return `
${tagCreators}

type ${generateType(syntax.type, imports)} = ${tags};
`.trim();
}

function generateProperty(syntax: Property, imports: Import[]): string {
    return `${syntax.name}: ${generateTopLevelType(syntax.type, imports)}`;
}

function generateTypeAlias(syntax: TypeAlias, imports: Import[]): string {
    const generatedProperties = syntax.properties.map((prop) =>
        generateProperty(prop, imports)
    );
    const properties =
        generatedProperties.length === 0
            ? ""
            : "    " + generatedProperties.join(";\n    ") + ";";
    const type = generateType(syntax.type, imports);
    const args =
        generatedProperties.length === 0
            ? " "
            : " " + generatedProperties.join(", ") + " ";

    return `
type ${type} = {
${properties}
}

function ${type}(args: {${args}}): ${type} {
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
    return `[ ${list.items
        .map((item) => generateExpression(item))
        .join(", ")} ]`;
}

function generateIfStatement(
    ifStatement: IfStatement,
    parentTypeArguments: string[]
): string {
    const isSimpleIfBody = isSimpleValue(ifStatement.ifBody.kind);
    const isSimpleElseBody = isSimpleValue(ifStatement.elseBody.kind);

    const ifBodyPrefix = isSimpleIfBody ? "return " : "";
    const elseBodyPrefix = isSimpleElseBody ? "return " : "";

    const maybeIfLetBody =
        ifStatement.ifLetBody.length > 0
            ? "\n" +
              prefixLines(
                  ifStatement.ifLetBody
                      .map((block) => generateBlock(block, parentTypeArguments))
                      .join("\n"),
                  4
              )
            : "";

    const ifBody = generateExpression(ifStatement.ifBody, parentTypeArguments);
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
                      .map((block) => generateBlock(block, parentTypeArguments))
                      .join("\n"),
                  4
              )
            : "";

    const elseBody = generateExpression(
        ifStatement.elseBody,
        parentTypeArguments
    );
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
const [ _0, ..._rest ] = _res868186726;
if (_0.kind === "${part.constructor}") {
    let _foundIndex: number = -1;
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

function generateBranch(
    predicate: string,
    branch: Branch,
    parentTypeArguments: string[]
): string {
    const returnWrapper = isSimpleValue(branch.body.kind) ? "    return " : "";
    const body = prefixLines(
        generateExpression(branch.body, parentTypeArguments),
        isSimpleValue(branch.body.kind) ? 0 : 4
    );
    const maybeLetBody =
        branch.letBody.length > 0
            ? "\n" +
              prefixLines(
                  branch.letBody
                      .map((block) => generateBlock(block, parentTypeArguments))
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

function generateCaseStatement(
    caseStatement: CaseStatement,
    parentTypeArguments: string[]
): string {
    const predicate = generateExpression(caseStatement.predicate);
    const name = `_res${hashCode(predicate)}`;
    const branches = caseStatement.branches.map((branch) =>
        generateBranch(name, branch, parentTypeArguments || [ ])
    );

    const isString =
        caseStatement.branches.filter(
            (branch) => branch.pattern.kind === "StringValue"
        ).length > 0;

    if (isString) {
        return `
const ${name} = ${predicate};
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
const ${name} = ${predicate};
switch (${name}.length) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
    }

    return `
const ${name} = ${predicate};
switch (${name}.kind) {
${prefixLines(branches.join("\n"), 4)}
}`.trim();
}

function getGenericTypesFromFunctionType(type_: FunctionType): GenericType[] {
    return type_.args.filter(
        (arg) => arg.kind === "GenericType"
    ) as GenericType[];
}

function typeHasOverlapWithImportedModule(
    type_: FixedType,
    imports: Import[]
): boolean {
    for (const import_ of imports) {
        for (const module_ of import_.modules) {
            if (
                module_.alias.kind === "just" &&
                module_.alias.value === type_.name
            ) {
                return true;
            }
        }
    }
    return false;
}

function generateTopLevelType(type_: Type, imports: Import[]): string {
    switch (type_.kind) {
        case "GenericType": {
            return generateType(type_, imports);
        }
        case "FixedType": {
            if (type_.name === "List") {
                if (type_.args[0] && type_.args[0].kind === "GenericType") {
                    return generateTopLevelType(type_.args[0], imports) + "[]";
                }

                const fixedArgs = type_.args.filter(
                    (type_) => type_.kind === "FixedType"
                );

                if (fixedArgs.length === 0) {
                    return "any[]";
                } else if (fixedArgs.length === 1) {
                    return `${generateTopLevelType(fixedArgs[0], imports)}[]`;
                }

                return `(${fixedArgs
                    .map((arg) => generateTopLevelType(arg, imports))
                    .join(" | ")})[]`;
            }

            if (
                type_.args.length > 0 &&
                type_.args[0].kind === "FixedType" &&
                type_.args[0].args.length > 0
            ) {
                return `${type_.name}<${type_.args
                    .map((arg) => generateTopLevelType(arg, imports))
                    .join(", ")}>`;
            }

            const args = [ ];

            for (const arg of type_.args) {
                if (arg.kind === "GenericType" || arg.kind === "FixedType") {
                    args.push(arg);
                } else {
                    for (const generic of getGenericTypesFromFunctionType(
                        arg
                    )) {
                        args.push(generic);
                    }
                }
            }

            const qualifiedName = typeHasOverlapWithImportedModule(
                type_,
                imports
            )
                ? `${type_.name}.${type_.name}`
                : type_.name;

            if (args.length === 0) {
                return qualifiedName;
            }

            return `${qualifiedName}<${args
                .map((arg) => generateType(arg, imports))
                .join(", ")}>`;
        }
        case "FunctionType": {
            const parts = [ ];
            let index = 0;
            for (const typePart of type_.args.slice(0, -1)) {
                parts.push(
                    `arg${index}: ${generateTopLevelType(typePart, imports)}`
                );
                index++;
            }

            return (
                "(" +
                parts.join(", ") +
                ") => " +
                generateType(type_.args[type_.args.length - 1], imports)
            );
        }
    }
}

function generateType(type_: Type, imports: Import[]): string {
    switch (type_.kind) {
        case "GenericType": {
            return type_.name;
        }
        case "FixedType": {
            if (type_.name === "List") {
                if (type_.args[0] && type_.args[0].kind === "GenericType") {
                    return generateType(type_.args[0], imports) + "[]";
                }
                const fixedArgs = type_.args.filter(
                    (type_) => type_.kind === "FixedType"
                );

                if (fixedArgs.length === 0) {
                    return "any[]";
                } else if (fixedArgs.length === 1) {
                    return `${generateType(fixedArgs[0], imports)}[]`;
                }

                return `(${fixedArgs
                    .map((arg) => generateType(arg, imports))
                    .join(" | ")})[]`;
            }

            const args = [ ];

            for (const arg of type_.args) {
                if (arg.kind === "GenericType") {
                    args.push(arg);
                } else if (arg.kind === "FunctionType") {
                    for (const generic of getGenericTypesFromFunctionType(
                        arg
                    )) {
                        args.push(generic);
                    }
                }
            }

            const qualifiedName = typeHasOverlapWithImportedModule(
                type_,
                imports
            )
                ? `${type_.name}.${type_.name}`
                : type_.name;

            if (args.length === 0) {
                return qualifiedName;
            }

            return `${qualifiedName}<${args
                .map((arg) => generateType(arg, imports))
                .join(", ")}>`;
        }
        case "FunctionType": {
            const parts = [ ];
            let index = 0;
            for (const typePart of type_.args.slice(0, -1)) {
                parts.push(`arg${index}: ${generateType(typePart, imports)}`);
                index++;
            }

            return (
                "(" +
                parts.join(", ") +
                ") => " +
                generateType(type_.args[type_.args.length - 1], imports)
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

function generateFunctionCall(
    functionCall: FunctionCall,
    parentTypeArguments?: string[],
    parentTypes?: Type[]
): string {
    const right = functionCall.args
        .map((item) => generateExpression(item))
        .join(", ");

    return `${functionCall.name}(${right})`;
}

function generateLambda(lambda: Lambda): string {
    const args = lambda.args.map((arg: any) => `${arg}: any`).join(", ");
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
    const args = lambdaCall.lambda.args
        .map((arg: any) => `${arg}: any`)
        .join(", ");
    const argsValues = lambdaCall.args
        .map((item) => generateExpression(item))
        .join(", ");
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

function generateExpression(
    expression: Expression,
    parentTypeArguments?: string[],
    parentTypes?: Type[]
): string {
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
            return generateIfStatement(expression, parentTypeArguments || [ ]);
        case "CaseStatement":
            return generateCaseStatement(
                expression,
                parentTypeArguments || [ ]
            );
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
            return generateFunctionCall(
                expression,
                parentTypeArguments || [ ],
                parentTypes || [ ]
            );
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

function generateDoBlock(
    doBody: DoBlock,
    parentTypeArguments: string[],
    parentTypes: Type[],
    imports: Import[]
): string {
    const lines = [ ];

    for (const expression of doBody.expressions) {
        switch (expression.kind) {
            case "Const": {
                lines.push(generateConst(expression, imports));
                break;
            }
            case "Function": {
                lines.push(
                    generateFunction(
                        expression,
                        parentTypeArguments,
                        parentTypes,
                        imports
                    )
                );
                break;
            }
            case "FunctionCall": {
                lines.push(
                    generateFunctionCall(
                        expression,
                        parentTypeArguments,
                        parentTypes
                    ) + ";"
                );
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

function generateFunction(
    function_: Function,
    parentTypeArguments: string[],
    parentTypes: Type[],
    imports: Import[]
): string {
    const functionArguments = function_.args
        .map((arg) => {
            switch (arg.kind) {
                case "FunctionArg":
                    return (
                        arg.name +
                        ": " +
                        generateTopLevelType(arg.type, imports)
                    );
                case "AnonFunctionArg":
                    return (
                        "_" +
                        arg.index +
                        ": " +
                        generateTopLevelType(arg.type, imports)
                    );
            }
        })
        .join(", ");

    const typeArguments = ([ ] as string[])
        .concat(
            ...function_.args.map((arg) => collectTypeArguments(arg.type)),
            collectTypeArguments(function_.returnType)
        )
        .filter(
            (value, index, arr) =>
                arr.indexOf(value) === index &&
                parentTypeArguments.indexOf(value) === -1
        );

    const maybeLetBody =
        function_.letBody.length > 0
            ? "\n" +
              prefixLines(
                  function_.letBody
                      .map((block) =>
                          generateBlock(
                              block,
                              [ ...typeArguments, ...parentTypeArguments ],
                              [ ],
                              imports
                          )
                      )
                      .join("\n"),
                  4
              )
            : "";

    const maybeDoBody =
        function_.doBody === null
            ? ""
            : "\n" +
              prefixLines(
                  generateDoBlock(
                      function_.doBody,
                      parentTypeArguments,
                      parentTypes,
                      imports
                  ),
                  4
              );

    const returnType = generateTopLevelType(function_.returnType, imports);
    const isSimpleBody = isSimpleValue(function_.body.kind);

    const bodyPrefix = isSimpleBody ? "return " : "";
    const bodySuffix = isSimpleBody ? ";" : "";
    const body =
        bodyPrefix +
        generateExpression(
            function_.body,
            [ ...typeArguments, ...parentTypeArguments ],
            [ ...parentTypes, function_.returnType ]
        ) +
        bodySuffix;

    const prefixedBody = prefixLines(body, 4);

    const typeArgumentsString =
        typeArguments.length === 0 ? "" : `<${typeArguments.join(", ")}>`;

    return `
function ${function_.name}${typeArgumentsString}(${functionArguments}): ${returnType} {${maybeLetBody}${maybeDoBody}
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
    return `(function (): any {
${prefixLines(generateExpression(expression), 4)}
})()`;
}

function generateNestedConst(
    constDef: Const,
    body: string,
    imports: Import[]
): string {
    const typeDef = generateTopLevelType(constDef.type, imports);
    const generatedBlocks = constDef.letBody
        .map((block) => generateBlock(block, [ ], [ ]))
        .join("\n");
    return `(function(): ${typeDef} {
${prefixLines(generatedBlocks, 4)}
    return ${body};
})()
`.trim();
}

function generateConst(constDef: Const, imports: Import[]): string {
    let body = "";

    switch (constDef.value.kind) {
        case "IfStatement": {
            if (constDef.letBody.length === 0) {
                body = generateInlineIf(constDef.value);
            } else {
                body = generateNestedConst(
                    constDef,
                    generateInlineIf(constDef.value),
                    imports
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
                    generateInlineCase(constDef.value),
                    imports
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
                    generateExpression(constDef.value),
                    imports
                );
            }
            break;
        }
    }
    const typeDef = generateTopLevelType(constDef.type, imports);

    return `
const ${constDef.name}: ${typeDef} = ${body};
`.trim();
}

function generateBlock(
    syntax: Block,
    parentTypeArguments?: string[],
    parentTypes?: Type[],
    imports?: Import[]
): string {
    switch (syntax.kind) {
        case "Import":
            return generateImportBlock(syntax);
        case "Export":
            return generateExportBlock(syntax);
        case "UnionType":
            return generateUnionType(syntax, imports || [ ]);
        case "TypeAlias":
            return generateTypeAlias(syntax, imports || [ ]);
        case "Function":
            return generateFunction(
                syntax,
                parentTypeArguments || [ ],
                parentTypes || [ ],
                imports || [ ]
            );
        case "Const":
            return generateConst(syntax, imports || [ ]);
        case "Comment":
        case "MultilineComment":
            return "";
    }
}

export function generateTypescript(module: Module): string {
    const imports: Import[] = module.body.filter(
        (block) => block.kind === "Import"
    ) as Import[];
    return [ exportTests(module), ...module.body ]
        .map((block) => generateBlock(block, [ ], [ ], imports))
        .filter((line) => line.length > 0)
        .join("\n\n");
}
