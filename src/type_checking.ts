import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { isBuiltinType } from "./builtins";
import {
    Addition,
    And,
    Block,
    Branch,
    CaseStatement,
    Constructor,
    Division,
    Equality,
    Expression,
    FixedType,
    FormatStringValue,
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
    ListRange,
    ListValue,
    ModuleReference,
    Multiplication,
    ObjectLiteral,
    Or,
    RightPipe,
    StringValue,
    Subtraction,
    Type,
    TypedBlock,
    Value,
} from "./types";

function isSameGenericType(
    first: GenericType,
    second: GenericType,
    topLevel: boolean
): boolean {
    if (topLevel) return true;
    return first.name === second.name;
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

export function isSameType(
    first: Type,
    second: Type,
    topLevel: boolean
): boolean {
    if (first.name === "any" || second.name === "any") return true;
    if (first.kind !== second.kind) return false;

    switch (first.kind) {
        case "FixedType": {
            return isSameFixedType(first, second as FixedType, topLevel);
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

function inferListValue(value: ListValue): Type {
    if (value.items.length === 0)
        return FixedType("List", [ FixedType("any", [ ]) ]);

    let types: Type[] = [ ];

    value.items.forEach((item: Expression) => {
        types.push(inferType(item));
    });

    const uniqueTypes = reduceTypes(types);

    return FixedType("List", uniqueTypes);
}

function inferListRange(value: ListRange): Type {
    return FixedType("List", [ FixedType("number", [ ]) ]);
}

function inferObjectLiteral(value: ObjectLiteral): Type {
    return FixedType("any", [ ]);
}

function inferIfStatement(value: IfStatement): Type {
    const ifBranch = inferType(value.ifBody);
    const elseBranch = inferType(value.elseBody);

    if (isSameType(ifBranch, elseBranch, false)) return ifBranch;

    return FixedType("any", [ ]);
}

function inferBranch(value: Branch): Type {
    return inferType(value.body);
}

function inferCaseStatement(value: CaseStatement): Type {
    const branches = reduceTypes(value.branches.map(inferBranch));

    if (branches.length === 1) return branches[0];

    return FixedType("any", [ ]);
}

function inferAddition(value: Addition): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right, false)) return FixedType("any", [ ]);
    return left;
}

function inferSubtraction(value: Subtraction): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right, false)) return FixedType("any", [ ]);
    return left;
}

function inferMultiplication(value: Multiplication): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right, false)) return FixedType("any", [ ]);
    return left;
}

function inferDivision(value: Division): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right, false)) return FixedType("any", [ ]);
    return left;
}

function inferLeftPipe(value: LeftPipe): Type {
    const right = inferType(value.right);

    return right;
}

function inferRightPipe(value: RightPipe): Type {
    const left = inferType(value.left);

    return left;
}

function inferModuleReference(value: ModuleReference): Type {
    return inferType(value.value);
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

function inferConstructor(value: Constructor): Type {
    return FixedType(value.constructor, [ ]);
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

export function inferType(expression: Expression): Type {
    switch (expression.kind) {
        case "Value":
            return inferValue(expression);
        case "StringValue":
            return inferStringValue(expression);
        case "FormatStringValue":
            return inferFormatStringValue(expression);
        case "ListValue":
            return inferListValue(expression);
        case "ListRange":
            return inferListRange(expression);
        case "ObjectLiteral":
            return inferObjectLiteral(expression);
        case "IfStatement":
            return inferIfStatement(expression);
        case "CaseStatement":
            return inferCaseStatement(expression);
        case "Addition":
            return inferAddition(expression);
        case "Subtraction":
            return inferSubtraction(expression);
        case "Multiplication":
            return inferMultiplication(expression);
        case "Division":
            return inferDivision(expression);
        case "And":
            return inferAnd(expression);
        case "Or":
            return inferOr(expression);
        case "LeftPipe":
            return inferLeftPipe(expression);
        case "RightPipe":
            return inferRightPipe(expression);
        case "ModuleReference":
            return inferModuleReference(expression);
        case "FunctionCall":
            return inferFunctionCall(expression);
        case "Lambda":
            return inferLambda(expression);
        case "LambdaCall":
            return inferLambdaCall(expression);
        case "Constructor":
            return inferConstructor(expression);
        case "Equality":
            return inferEquality(expression);
        case "InEquality":
            return inferInEquality(expression);
        case "LessThan":
            return inferLessThan(expression);
        case "LessThanOrEqual":
            return inferLessThanOrEqual(expression);
        case "GreaterThan":
            return inferGreaterThan(expression);
        case "GreaterThanOrEqual":
            return inferGreaterThanOrEqual(expression);
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
    if (isBuiltinType(type.name)) return true;
    if (type.name === "List") return true;

    for (const block of blocks) {
        if (isSameType(type, block.type, true)) return true;
    }

    for (const import_ of imports) {
        for (const module of import_.modules) {
            for (const exposed of module.exposing) {
                if (type.name === exposed) return true;
            }
        }
    }

    return false;
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
                    )} did not exist in the namespace.`
                );
            }

            const inferred = inferType(block.value);

            if (isSameType(block.type, inferred, false)) {
                return Ok(block.type);
            }

            return Err(
                `Expected \`${typeToString(
                    block.type
                )}\` but got \`${typeToString(inferred)}\``
            );
        }

        case "Function": {
            if (
                !typeExistsInNamespace(block.returnType, typedBlocks, imports)
            ) {
                return Err(
                    `Type ${typeToString(
                        block.returnType
                    )} did not exist in the namespace.`
                );
            }

            const inferred = inferType(block.body);

            if (isSameType(block.returnType, inferred, false)) {
                return Ok(block.returnType);
            }

            return Err(
                `Expected \`${typeToString(
                    block.returnType
                )}\` but got \`${typeToString(
                    inferred
                )}\` in the body of the function`
            );
        }

        case "UnionType":
        case "TypeAlias": {
            return Ok(block.type);
        }

        case "Export":
        case "Import": {
            return Ok(FixedType("any", [ ]));
        }
    }
}
