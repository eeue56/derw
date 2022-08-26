import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
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
    Expression,
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
    Lambda,
    LambdaCall,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListPrepend,
    ListRange,
    ListValue,
    Mod,
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
    TypedBlock,
    Value,
} from "./types";

function isSameGenericType(
    first: GenericType,
    second: GenericType,
    topLevel: boolean
): boolean {
    if (topLevel) return true;
    // todo: figure this out
    //return first.name === second.name;
    return true;
}

function isSameFixedType(
    first: FixedType,
    second: FixedType,
    topLevel: boolean
): boolean {
    if (
        (first.name === "any" && first.args.length === 0) ||
        (second.name === "any" && second.args.length === 0)
    ) {
        return true;
    }

    if (first.args.length !== second.args.length) {
        return false;
    }

    if (first.name !== second.name) return false;

    for (var i = 0; i < first.args.length; i++) {
        if (!isSameType(first.args[i], second.args[i], topLevel)) {
            return false;
        }
    }

    return true;
}

function isSameFunctionType(
    first: FunctionType,
    second: FunctionType,
    topLevel: boolean
): boolean {
    if (first.args.length !== second.args.length) {
        return false;
    }

    for (var i = 0; i < first.args.length; i++) {
        if (!isSameType(first.args[i], second.args[i], topLevel)) {
            return false;
        }
    }

    return true;
}

function doesFunctionTypeContainType(
    first: FunctionType,
    second: GenericType | FixedType,
    topLevel: boolean
): boolean {
    switch (second.kind) {
        case "GenericType": {
            for (const arg of first.args) {
                if (isSameType(arg, second, topLevel)) {
                    return true;
                }
            }
        }
        case "FixedType": {
            for (const arg of first.args) {
                if (isSameType(arg, second, topLevel)) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function isSameType(
    first: Type,
    second: Type,
    topLevel: boolean
): boolean {
    if (
        (first.kind !== "FunctionType" && first.name === "any") ||
        (second.kind !== "FunctionType" && second.name === "any")
    )
        return true;

    if (first.kind !== second.kind) {
        if (first.kind === "FunctionType" && second.kind !== "FunctionType") {
            return doesFunctionTypeContainType(first, second, topLevel);
        }

        if (first.kind === "FixedType" && second.kind === "GenericType") {
            return true;
        }

        if (second.kind === "FixedType" && first.kind === "GenericType") {
            return true;
        }
        return false;
    }

    switch (first.kind) {
        case "FixedType": {
            if (first.name.indexOf(".") > -1) {
                const split = first.name.split(".");
                first = {
                    ...first,
                    name: split[split.length - 1],
                };
            }
            second = second as FixedType;
            if (second.name.indexOf(".") > -1) {
                const split = second.name.split(".");
                second = {
                    ...second,
                    name: split[split.length - 1],
                };
            }

            return isSameFixedType(first, second, topLevel);
        }
        case "GenericType": {
            return isSameGenericType(first, second as GenericType, topLevel);
        }
        case "FunctionType": {
            return isSameFunctionType(first, second as FunctionType, topLevel);
        }
    }
}

function inferValue(value: Value): Type {
    if (parseInt(value.body, 10)) {
        return FixedType("number", [ ]);
    }
    return FixedType("any", [ ]);
}

function inferStringValue(value: StringValue): Type {
    return FixedType("string", [ ]);
}

function inferFormatStringValue(value: FormatStringValue): Type {
    return FixedType("string", [ ]);
}

function reduceTypes(types: Type[]): Type[] {
    return types.reduce((uniques: Type[], type) => {
        if (
            uniques.filter((unique) => isSameType(unique, type, false))
                .length === 0
        ) {
            uniques.push(type);
        }
        return uniques;
    }, [ ]);
}

function inferListValue(
    value: ListValue,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    if (value.items.length === 0)
        return Ok(FixedType("List", [ FixedType("any", [ ]) ]));

    let types: Type[] = [ ];

    for (const item of value.items) {
        const inferred = inferType(item, typedBlocks);
        if (inferred.kind === "Err") return inferred;
        types.push(inferred.value);
    }

    const uniqueTypes = reduceTypes(types);

    return Ok(FixedType("List", uniqueTypes));
}

function inferListRange(value: ListRange): Type {
    return FixedType("List", [ FixedType("number", [ ]) ]);
}

function inferObjectLiteral(
    value: ObjectLiteral,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const typeAlias = TypeAlias(
        FixedType("Inferred", [ ]),
        value.fields.map((field) => {
            const inferred = inferType(field.value, typedBlocks);
            if (inferred.kind === "Err") {
                return Property(field.name, GenericType("any"));
            }

            return Property(field.name, inferred.value);
        })
    );

    for (const block of typedBlocks) {
        if (
            block.kind != "TypeAlias" ||
            block.properties.length !== typeAlias.properties.length
        ) {
            continue;
        }

        let blockMatches = true;

        for (const inferredProperty of typeAlias.properties) {
            const hasMatchingBlockProperty =
                block.properties.filter((prop) => {
                    return (
                        prop.name === inferredProperty.name &&
                        isSameType(prop.type, inferredProperty.type, false)
                    );
                }).length > 0;

            if (!hasMatchingBlockProperty) {
                blockMatches = false;
                break;
            }
        }
        if (blockMatches) {
            return Ok(block.type);
        }
    }

    return Ok(FixedType("any", [ ]));
}

function inferIfStatement(
    value: IfStatement,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const ifBranch = inferType(value.ifBody, typedBlocks);
    const elseBranch = inferType(value.elseBody, typedBlocks);

    if (ifBranch.kind === "Err") return ifBranch;
    if (elseBranch.kind === "Err") return elseBranch;

    if (isSameType(ifBranch.value, elseBranch.value, false))
        return Ok(ifBranch.value);

    return Err(
        `Conflicting types: ${typeToString(ifBranch.value)}, ${typeToString(
            elseBranch.value
        )}`
    );
}

function inferBranch(
    value: Branch,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    return inferType(value.body, typedBlocks);
}

function inferCaseStatement(
    value: CaseStatement,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const typesToReduce = [ ];

    for (const branch of value.branches) {
        const inf = inferBranch(branch, typedBlocks);
        if (inf.kind === "Err") return inf;
        typesToReduce.push(inf.value);
    }
    const branches = reduceTypes(typesToReduce);

    if (branches.length === 1) return Ok(branches[0]);

    return Err(`Conflicting types: ${branches.map(typeToString).join(", ")}`);
}

function inferAddition(
    value: Addition,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const left = inferType(value.left, typedBlocks);
    const right = inferType(value.right, typedBlocks);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferSubtraction(
    value: Subtraction,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const left = inferType(value.left, typedBlocks);
    const right = inferType(value.right, typedBlocks);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferMultiplication(
    value: Multiplication,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const left = inferType(value.left, typedBlocks);
    const right = inferType(value.right, typedBlocks);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferDivision(
    value: Division,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const left = inferType(value.left, typedBlocks);
    const right = inferType(value.right, typedBlocks);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferMod(value: Mod, typedBlocks: TypedBlock[]): Result<string, Type> {
    const left = inferType(value.left, typedBlocks);
    const right = inferType(value.right, typedBlocks);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferLeftPipe(
    value: LeftPipe,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const right = inferType(value.right, typedBlocks);

    return right;
}

function inferRightPipe(
    value: RightPipe,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const left = inferType(value.left, typedBlocks);

    return left;
}

function inferModuleReference(
    value: ModuleReference,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    return inferType(value.value, typedBlocks);
}

function inferFunctionCall(value: FunctionCall): Type {
    return FixedType("any", [ ]);
}

function inferLambda(value: Lambda): Type {
    return FixedType("any", [ ]);
}

function inferLambdaCall(value: LambdaCall): Type {
    return FixedType("any", [ ]);
}

function inferConstructor(value: Constructor, typedBlocks: TypedBlock[]): Type {
    for (const block of typedBlocks) {
        if (block.kind === "UnionType") {
            for (const tag of block.tags) {
                if (value.constructor === tag.name) {
                    return block.type;
                }
            }
        }
    }
    return FixedType("any", [ ]);
}

function inferEquality(value: Equality): Type {
    return FixedType("boolean", [ ]);
}

function inferInEquality(value: InEquality): Type {
    return FixedType("boolean", [ ]);
}

function inferLessThan(value: LessThan): Type {
    return FixedType("boolean", [ ]);
}

function inferLessThanOrEqual(value: LessThanOrEqual): Type {
    return FixedType("boolean", [ ]);
}

function inferGreaterThan(value: GreaterThan): Type {
    return FixedType("boolean", [ ]);
}

function inferGreaterThanOrEqual(value: GreaterThanOrEqual): Type {
    return FixedType("boolean", [ ]);
}

function inferAnd(value: And): Type {
    return FixedType("boolean", [ ]);
}

function inferOr(value: Or): Type {
    return FixedType("boolean", [ ]);
}

function inferListPrepend(
    value: ListPrepend,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    const leftInfer = inferType(value.left, typedBlocks);
    const rightInfer = inferType(value.right, typedBlocks);

    if (leftInfer.kind === "Err") return leftInfer;
    if (rightInfer.kind === "Err") return rightInfer;

    if (
        rightInfer.value.kind === "GenericType" ||
        (rightInfer.value.kind === "FixedType" &&
            rightInfer.value.name === "any")
    )
        return Ok(FixedType("List", [ GenericType("any") ]));
    if (rightInfer.value.kind === "FunctionType")
        return Err(
            "Inferred list on right hand side of :: to be a function, not a list"
        );

    if (rightInfer.value.name === "List" && rightInfer.value.args.length > 0) {
        const isEmptyList =
            value.right.kind === "ListValue" && value.right.items.length === 0;

        if (isEmptyList) {
            return Ok(FixedType("List", [ leftInfer.value ]));
        }

        const listElementType = rightInfer.value.args[0];

        if (isSameType(leftInfer.value, listElementType, false)) {
            return Ok(rightInfer.value);
        }
        return Err(
            `Invalid types in :: - lefthand (${typeToString(
                leftInfer.value
            )}) must match elements of righthand (${typeToString(
                listElementType
            )})`
        );
    }

    return Err(
        `Expected list on righthand side of :: but got ${typeToString(
            rightInfer.value
        )}.`
    );
}

export function inferType(
    expression: Expression,
    typedBlocks: TypedBlock[]
): Result<string, Type> {
    switch (expression.kind) {
        case "Value":
            return Ok(inferValue(expression));
        case "StringValue":
            return Ok(inferStringValue(expression));
        case "FormatStringValue":
            return Ok(inferFormatStringValue(expression));
        case "ListValue":
            return inferListValue(expression, typedBlocks);
        case "ListRange":
            return Ok(inferListRange(expression));
        case "ObjectLiteral":
            return inferObjectLiteral(expression, typedBlocks);
        case "IfStatement":
            return inferIfStatement(expression, typedBlocks);
        case "CaseStatement":
            return inferCaseStatement(expression, typedBlocks);
        case "Addition":
            return inferAddition(expression, typedBlocks);
        case "Subtraction":
            return inferSubtraction(expression, typedBlocks);
        case "Multiplication":
            return inferMultiplication(expression, typedBlocks);
        case "Division":
            return inferDivision(expression, typedBlocks);
        case "Mod":
            return inferMod(expression, typedBlocks);
        case "And":
            return Ok(inferAnd(expression));
        case "Or":
            return Ok(inferOr(expression));
        case "ListPrepend":
            return inferListPrepend(expression, typedBlocks);
        case "LeftPipe":
            return inferLeftPipe(expression, typedBlocks);
        case "RightPipe":
            return inferRightPipe(expression, typedBlocks);
        case "ModuleReference":
            return inferModuleReference(expression, typedBlocks);
        case "FunctionCall":
            return Ok(inferFunctionCall(expression));
        case "Lambda":
            return Ok(inferLambda(expression));
        case "LambdaCall":
            return Ok(inferLambdaCall(expression));
        case "Constructor":
            return Ok(inferConstructor(expression, typedBlocks));
        case "Equality":
            return Ok(inferEquality(expression));
        case "InEquality":
            return Ok(inferInEquality(expression));
        case "LessThan":
            return Ok(inferLessThan(expression));
        case "LessThanOrEqual":
            return Ok(inferLessThanOrEqual(expression));
        case "GreaterThan":
            return Ok(inferGreaterThan(expression));
        case "GreaterThanOrEqual":
            return Ok(inferGreaterThanOrEqual(expression));
    }
}

function typeToString(type: Type): string {
    switch (type.kind) {
        case "GenericType": {
            return type.name;
        }
        case "FixedType": {
            const typeArgs =
                type.args.length === 0
                    ? ""
                    : " (" + type.args.map(typeToString).join(" ") + ")";
            return `${type.name}${typeArgs}`.trim();
        }
        case "FunctionType": {
            return type.args.map(typeToString).join("->");
        }
    }
}

function typeExistsInNamespace(
    type: Type,
    blocks: TypedBlock[],
    imports: Import[]
): boolean {
    if (type.kind === "FunctionType") return true;
    if (isBuiltinType(type.name)) return true;
    if (type.name === "List") return true;
    if (type.kind === "GenericType") return true;

    for (const block of blocks) {
        if (isSameType(type, block.type, true)) return true;
    }

    for (const import_ of imports) {
        for (const module of import_.modules) {
            for (const exposed of module.exposing) {
                if (type.name === exposed) return true;
            }

            if (
                type.name.indexOf(".") > -1 &&
                module.alias.kind === "Just" &&
                type.name.split(".")[0] === module.alias.value
            ) {
                return true;
            }
        }
    }

    return false;
}

function finalExpressions(expression: Expression): string[] {
    switch (expression.kind) {
        case "Value":
            return [ ];
        case "StringValue":
            return [ expression.body ];
        case "FormatStringValue":
            return [ ];
        case "ListValue":
            return [ ];
        case "ListRange":
            return [ ];
        case "ObjectLiteral":
            return [ ];
        case "IfStatement":
            return finalExpressions(expression.ifBody).concat(
                finalExpressions(expression.elseBody)
            );
        case "CaseStatement":
            let expressions: string[] = [ ];

            for (const branch of expression.branches) {
                expressions = expressions.concat(finalExpressions(branch.body));
            }
            return expressions;
        case "Addition":
            return [ ];
        case "Subtraction":
            return [ ];
        case "Multiplication":
            return [ ];
        case "Division":
            return [ ];
        case "Mod":
            return [ ];
        case "And":
            return [ ];
        case "Or":
            return [ ];
        case "ListPrepend":
            return [ ];
        case "LeftPipe":
            return [ ];
        case "RightPipe":
            return [ ];
        case "ModuleReference":
            return [ ];
        case "FunctionCall":
            return [ ];
        case "Lambda":
            return [ ];
        case "LambdaCall":
            return [ ];
        case "Constructor":
            return [ ];
        case "Equality":
            return [ ];
        case "InEquality":
            return [ ];
        case "LessThan":
            return [ ];
        case "LessThanOrEqual":
            return [ ];
        case "GreaterThan":
            return [ ];
        case "GreaterThanOrEqual":
            return [ ];
    }
}

function allFinalExpressions(block: Block): string[] {
    switch (block.kind) {
        case "Const": {
            return finalExpressions(block.value);
        }
        case "Function": {
            return finalExpressions(block.body);
        }
        default: {
            return [ ];
        }
    }
}

function validateAllBranchesCovered(
    typedBlocks: TypedBlock[],
    containingBlock: Const | Function,
    expression: CaseStatement
): Result<string, true> {
    const hasDefault =
        expression.branches.filter((b) => b.pattern.kind === "Default").length >
        0;

    const casePattern = expression.predicate;

    let predicateType: Type | null = null;

    if (casePattern.kind === "Value") {
        if (containingBlock.kind === "Function") {
            for (const arg of containingBlock.args) {
                if (arg.kind === "FunctionArg") {
                    if (arg.name === casePattern.body) {
                        predicateType = arg.type;
                    }
                }
            }
        }
    }

    if (predicateType && predicateType?.kind === "FixedType") {
        const matchingBlocks = typedBlocks.filter((b) =>
            isSameType(b.type, predicateType as Type, false)
        );

        if (matchingBlocks.length > 0) {
            const matchingBlock = matchingBlocks[0];
            if (matchingBlock.kind === "UnionUntaggedType") {
                const strings = matchingBlock.values.map((s) => s.body);
                const seenStrings: string[] = [ ];

                for (const branch of expression.branches) {
                    if (branch.pattern.kind === "StringValue") {
                        seenStrings.push(branch.pattern.body);
                    }
                }

                const missingBranches = strings.filter(
                    (s) => seenStrings.indexOf(s) === -1
                );
                const extraBranches = seenStrings.filter(
                    (s) => strings.indexOf(s) === -1
                );

                let errors = [ ];
                if (missingBranches.length > 0 && !hasDefault) {
                    errors.push(
                        `All possible branches of a untagged union must be covered. I expected a branch for ${missingBranches
                            .map((s) => `"${s}"`)
                            .join(
                                " | "
                            )} but they were missing. If you don't need one, have a default branch`
                    );
                }
                if (extraBranches.length > 0) {
                    errors.push(
                        `I got too many branches. The branches for ${extraBranches
                            .map((s) => `"${s}"`)
                            .join(
                                " | "
                            )} aren't part of the untagged union so will never be true. Remove them.`
                    );
                }

                if (errors.length > 0) {
                    errors = [
                        `The case statement did not match the untagged union ${typeToString(
                            predicateType
                        )}`,
                        ...errors,
                    ];
                    return Err(errors.join("\n"));
                }

                return Ok(true);
            } else if (matchingBlock.kind === "UnionType") {
                const names = matchingBlock.tags.map((t) => t.name);
                const seenNames: string[] = [ ];

                for (const branch of expression.branches) {
                    if (branch.pattern.kind === "Destructure") {
                        seenNames.push(branch.pattern.constructor);
                    }
                }

                const missingBranches = names.filter(
                    (s) => seenNames.indexOf(s) === -1
                );
                const extraBranches = seenNames.filter(
                    (s) => names.indexOf(s) === -1
                );

                let errors = [ ];
                if (missingBranches.length > 0 && !hasDefault) {
                    errors.push(
                        `All possible branches of a union must be covered. I expected a branch for ${missingBranches.join(
                            " | "
                        )} but they were missing. If you don't need one, have a default branch`
                    );
                }
                if (extraBranches.length > 0) {
                    errors.push(
                        `I got too many branches. The branches for ${extraBranches.join(
                            " | "
                        )} aren't part of the union so will never be true. Remove them.`
                    );
                }

                if (errors.length > 0) {
                    errors = [
                        `The case statement did not match the union ${typeToString(
                            predicateType
                        )}`,
                        ...errors,
                    ];
                    return Err(errors.join("\n"));
                }

                return Ok(true);
            }
        }
    }

    return Ok(true);
}

export function getCasesFromFunction(block: Function): CaseStatement[] {
    const body = block.body;

    const statements = [ ];

    if (body.kind === "CaseStatement") statements.push(body);

    return statements;
}

export function validateAllCasesCovered(
    block: Block,
    typedBlocks: TypedBlock[]
): string[] {
    if (block.kind !== "Function") {
        return [ ];
    }

    const cases = getCasesFromFunction(block);
    const invalidBranches: string[] = [ ];

    for (const case_ of cases) {
        const valid = validateAllBranchesCovered(typedBlocks, block, case_);

        if (valid.kind === "Err") {
            invalidBranches.push(valid.error);
        }
    }

    return invalidBranches;
}

export function validateType(
    block: Block,
    typedBlocks: TypedBlock[],
    imports: Import[]
): Result<string, Type> {
    switch (block.kind) {
        case "Const": {
            if (!typeExistsInNamespace(block.type, typedBlocks, imports)) {
                return Err(
                    `Type ${typeToString(
                        block.type
                    )} did not exist in the namespace`
                );
            }

            const inferredRes = inferType(block.value, typedBlocks);
            if (inferredRes.kind === "Err") return inferredRes;
            const inferred = inferredRes.value;
            if (isSameType(block.type, inferred, false)) {
                return Ok(block.type);
            }

            if (inferred.kind === "FixedType" && inferred.name === "string") {
                if (block.type.kind === "FixedType") {
                    const matchingBlocks = typedBlocks.filter((b) =>
                        isSameType(b.type, block.type, false)
                    );

                    if (matchingBlocks.length > 0) {
                        const matchingBlock = matchingBlocks[0];
                        if (matchingBlock.kind === "UnionUntaggedType") {
                            const finalExpressions = allFinalExpressions(block);

                            for (const finalExpression of finalExpressions) {
                                const isCovered =
                                    matchingBlock.values.filter(
                                        (v) => v.body === finalExpression
                                    ).length > 0;
                                if (!isCovered) {
                                    return Err(
                                        `Expected \`${typeToString(
                                            block.type
                                        )}, composed of ${matchingBlock.values
                                            .map((v) => `"${v.body}"`)
                                            .join(
                                                " | "
                                            )}\` but got \`${finalExpression}\` in the body of the function`
                                    );
                                }
                            }

                            return Ok(block.type);
                        }
                    }
                }
            }

            return Err(
                `Expected \`${typeToString(
                    block.type
                )}\` but got \`${typeToString(inferred)}\``
            );
        }

        case "Function": {
            const notExistingErrors = [ ];

            if (
                !typeExistsInNamespace(block.returnType, typedBlocks, imports)
            ) {
                notExistingErrors.push(
                    `Type ${typeToString(
                        block.returnType
                    )} did not exist in the namespace`
                );
            }

            for (const arg of block.args) {
                if (!typeExistsInNamespace(arg.type, typedBlocks, imports)) {
                    notExistingErrors.push(
                        `Type ${typeToString(
                            arg.type
                        )} did not exist in the namespace`
                    );
                }
            }

            if (notExistingErrors.length > 0) {
                return Err(notExistingErrors.join("\n"));
            }

            const inferredRes = inferType(block.body, typedBlocks);
            if (inferredRes.kind === "Err") return inferredRes;
            const inferred = inferredRes.value;

            if (inferred.kind === "FixedType" && inferred.name === "string") {
                if (block.returnType.kind === "FixedType") {
                    const matchingBlocks = typedBlocks.filter((b) =>
                        isSameType(b.type, block.returnType, false)
                    );

                    if (matchingBlocks.length > 0) {
                        const matchingBlock = matchingBlocks[0];
                        if (matchingBlock.kind === "UnionUntaggedType") {
                            const finalExpressions = allFinalExpressions(block);

                            for (const finalExpression of finalExpressions) {
                                const isCovered =
                                    matchingBlock.values.filter(
                                        (v) => v.body === finalExpression
                                    ).length > 0;
                                if (!isCovered) {
                                    return Err(
                                        `Expected \`${typeToString(
                                            block.returnType
                                        )}, composed of ${matchingBlock.values
                                            .map((v) => `"${v.body}"`)
                                            .join(
                                                " | "
                                            )}\` but got \`${finalExpression}\` in the body of the function`
                                    );
                                }
                            }

                            return Ok(block.returnType);
                        }
                    }
                }
            }

            if (!isSameType(block.returnType, inferred, false)) {
                return Err(
                    `Expected \`${typeToString(
                        block.returnType
                    )}\` but got \`${typeToString(
                        inferred
                    )}\` in the body of the function`
                );
            }

            return Ok(block.returnType);
        }

        case "UnionType":
        case "UnionUntaggedType":
        case "TypeAlias": {
            return Ok(block.type);
        }

        case "MultilineComment":
        case "Comment":
        case "Export":
        case "Import": {
            return Ok(FixedType("any", [ ]));
        }
    }
}
