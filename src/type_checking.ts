import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
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
    GenericType,
    GreaterThan,
    GreaterThanOrEqual,
    IfStatement,
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
    Value,
} from "./types";

function isSameGenericType(first: GenericType, second: GenericType): boolean {
    return first.name === second.name;
}

function isSameFixedType(first: FixedType, second: FixedType): boolean {
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
        if (!isSameType(first.args[i], second.args[i])) {
            return false;
        }
    }

    return true;
}

export function isSameType(first: Type, second: Type): boolean {
    if (first.name === "any" || second.name === "any") return true;
    if (first.kind !== second.kind) return false;

    switch (first.kind) {
        case "FixedType": {
            return isSameFixedType(first, second as FixedType);
        }
        case "GenericType": {
            return isSameGenericType(first, second as GenericType);
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
        if (uniques.filter((unique) => isSameType(unique, type)).length === 0) {
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

    if (isSameType(ifBranch, elseBranch)) return ifBranch;

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

    if (!isSameType(left, right)) return FixedType("any", [ ]);
    return left;
}

function inferSubtraction(value: Subtraction): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right)) return FixedType("any", [ ]);
    return left;
}

function inferMultiplication(value: Multiplication): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right)) return FixedType("any", [ ]);
    return left;
}

function inferDivision(value: Division): Type {
    const left = inferType(value.left);
    const right = inferType(value.right);

    if (!isSameType(left, right)) return FixedType("any", [ ]);
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

function typeToText(type: Type): string {
    switch (type.kind) {
        case "GenericType": {
            return type.name;
        }
        case "FixedType": {
            return `${type.name} ${type.args.map(typeToText).join(" ")}`.trim();
        }
    }
}

export function validateType(block: Block): Result<string, Type> {
    switch (block.kind) {
        case "Const": {
            const inferred = inferType(block.value);

            if (isSameType(block.type, inferred)) {
                return Ok(block.type);
            }

            return Err(
                `Expected \`${typeToText(block.type)}\` but got \`${typeToText(
                    inferred
                )}\``
            );
        }

        case "Function": {
            const inferred = inferType(block.body);

            if (isSameType(block.returnType, inferred)) {
                return Ok(block.returnType);
            }

            return Err(
                `Expected \`${typeToText(
                    block.returnType
                )}\` but got \`${typeToText(
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
