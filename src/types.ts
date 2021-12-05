export type GenericType = {
    kind: "GenericType";
    name: string;
};

export function GenericType(name: string): GenericType {
    return {
        kind: "GenericType",
        name,
    };
}

export type FixedType = {
    kind: "FixedType";
    name: string;
    args: Type[];
};

export function FixedType(name: string, args: Type[]): FixedType {
    return {
        kind: "FixedType",
        name,
        args,
    };
}

export type Type = GenericType | FixedType;

export type TagArg = {
    kind: "TagArg";
    name: string;
    type: Type;
};

export function TagArg(name: string, type: Type): TagArg {
    return {
        kind: "TagArg",
        name,
        type,
    };
}

export type Tag = {
    kind: "Tag";
    name: string;
    args: TagArg[];
};

export function Tag(name: string, args: TagArg[]): Tag {
    return {
        kind: "Tag",
        name,
        args,
    };
}

export type UnionType = {
    kind: "UnionType";
    type: Type;
    tags: Tag[];
};

export function UnionType(type: Type, tags: Tag[]): UnionType {
    return {
        kind: "UnionType",
        type,
        tags,
    };
}

export type Property = {
    kind: "Property";
    name: string;
    type: Type;
};

export function Property(name: string, type: Type): Property {
    return {
        kind: "Property",
        name,
        type,
    };
}

export type TypeAlias = {
    kind: "TypeAlias";
    type: Type;
    properties: Property[];
};

export function TypeAlias(type: Type, properties: Property[]): TypeAlias {
    return {
        kind: "TypeAlias",
        type,
        properties,
    };
}

export type FunctionArg = {
    kind: "FunctionArg";
    name: string;
    type: Type;
};

export function FunctionArg(name: string, type: Type): FunctionArg {
    return {
        kind: "FunctionArg",
        name,
        type,
    };
}

export type AnonFunctionArg = {
    kind: "AnonFunctionArg";
    index: number;
    type: Type;
};

export function AnonFunctionArg(index: number, type: Type): AnonFunctionArg {
    return {
        kind: "AnonFunctionArg",
        index,
        type,
    };
}

export type FunctionArgsUnion = FunctionArg | AnonFunctionArg;

export type Value = {
    kind: "Value";
    body: string;
};

export function Value(body: string): Value {
    return {
        kind: "Value",
        body,
    };
}

export type Field = {
    kind: "Field";
    name: string;
    value: Expression;
};

export function Field(name: string, value: Expression): Field {
    return {
        kind: "Field",
        name,
        value,
    };
}

export type ObjectLiteral = {
    kind: "ObjectLiteral";
    fields: Field[];
};

export function ObjectLiteral(fields: Field[]): ObjectLiteral {
    return {
        kind: "ObjectLiteral",
        fields,
    };
}

export type StringValue = {
    kind: "StringValue";
    body: string;
};

export function StringValue(body: string): StringValue {
    return {
        kind: "StringValue",
        body,
    };
}

export type ListValue = {
    kind: "ListValue";
    items: Expression[];
};

export function ListValue(items: Expression[]): ListValue {
    return {
        kind: "ListValue",
        items,
    };
}

export type FormatStringValue = {
    kind: "FormatStringValue";
    body: string;
};

export function FormatStringValue(body: string): FormatStringValue {
    return {
        kind: "FormatStringValue",
        body,
    };
}

export type Destructure = {
    kind: "Destructure";
    constructor: string;
    pattern: string;
};

export function Destructure(constructor: string, pattern: string): Destructure {
    return {
        kind: "Destructure",
        constructor,
        pattern,
    };
}

export type Constructor = {
    kind: "Constructor";
    constructor: string;
    pattern: string;
};

export function Constructor(constructor: string, pattern: string): Constructor {
    return {
        kind: "Constructor",
        constructor,
        pattern,
    };
}

export type IfStatement = {
    kind: "IfStatement";
    predicate: Expression;
    ifBody: Expression;
    elseBody: Expression;
};

export function IfStatement(
    predicate: Expression,
    ifBody: Expression,
    elseBody: Expression
): IfStatement {
    return {
        kind: "IfStatement",
        predicate,
        ifBody,
        elseBody,
    };
}

export type Addition = {
    kind: "Addition";
    left: Expression;
    right: Expression;
};

export function Addition(left: Expression, right: Expression): Addition {
    return {
        kind: "Addition",
        left,
        right,
    };
}

export type Subtraction = {
    kind: "Subtraction";
    left: Expression;
    right: Expression;
};

export function Subtraction(left: Expression, right: Expression): Subtraction {
    return {
        kind: "Subtraction",
        left,
        right,
    };
}

export type Multiplication = {
    kind: "Multiplication";
    left: Expression;
    right: Expression;
};

export function Multiplication(
    left: Expression,
    right: Expression
): Multiplication {
    return {
        kind: "Multiplication",
        left,
        right,
    };
}

export type Division = {
    kind: "Division";
    left: Expression;
    right: Expression;
};

export function Division(left: Expression, right: Expression): Division {
    return {
        kind: "Division",
        left,
        right,
    };
}

export type LeftPipe = {
    kind: "LeftPipe";
    left: Expression;
    right: LeftPipeableExpression;
};

export function LeftPipe(
    left: Expression,
    right: LeftPipeableExpression
): LeftPipe {
    return {
        kind: "LeftPipe",
        left,
        right,
    };
}

export type RightPipe = {
    kind: "RightPipe";
    left: Expression;
    right: Expression;
};

export function RightPipe(left: Expression, right: Expression): RightPipe {
    return {
        kind: "RightPipe",
        left,
        right,
    };
}

export type ModuleReference = {
    kind: "ModuleReference";
    path: string[];
    value: Expression;
};

export function ModuleReference(
    path: string[],
    value: Expression
): ModuleReference {
    return {
        kind: "ModuleReference",
        path,
        value,
    };
}

export type FunctionCall = {
    kind: "FunctionCall";
    name: string;
    args: Expression[];
};

export function FunctionCall(name: string, args: Expression[]): FunctionCall {
    return {
        kind: "FunctionCall",
        name,
        args,
    };
}

export type Lambda = {
    kind: "Lambda";
    args: string[];
    body: Expression;
};

export function Lambda(args: string[], body: Expression): Lambda {
    return {
        kind: "Lambda",
        args,
        body,
    };
}

export type Branch = {
    kind: "Branch";
    pattern: Destructure;
    body: Expression;
};

export function Branch(pattern: Destructure, body: Expression): Branch {
    return {
        kind: "Branch",
        pattern,
        body,
    };
}

export type CaseStatement = {
    kind: "CaseStatement";
    predicate: Expression;
    branches: Branch[];
};

export function CaseStatement(
    predicate: Expression,
    branches: Branch[]
): CaseStatement {
    return {
        kind: "CaseStatement",
        predicate,
        branches,
    };
}

export type Equality = {
    kind: "Equality";
    leftHand: Expression;
    rightHand: Expression;
};

export function Equality(
    leftHand: Expression,
    rightHand: Expression
): Equality {
    return {
        kind: "Equality",
        leftHand,
        rightHand,
    };
}

export type InEquality = {
    kind: "InEquality";
    leftHand: Expression;
    rightHand: Expression;
};

export function InEquality(
    leftHand: Expression,
    rightHand: Expression
): InEquality {
    return {
        kind: "InEquality",
        leftHand,
        rightHand,
    };
}

export type LessThan = {
    kind: "LessThan";
    leftHand: Expression;
    rightHand: Expression;
};

export function LessThan(
    leftHand: Expression,
    rightHand: Expression
): LessThan {
    return {
        kind: "LessThan",
        leftHand,
        rightHand,
    };
}

export type LessThanOrEqual = {
    kind: "LessThanOrEqual";
    leftHand: Expression;
    rightHand: Expression;
};

export function LessThanOrEqual(
    leftHand: Expression,
    rightHand: Expression
): LessThanOrEqual {
    return {
        kind: "LessThanOrEqual",
        leftHand,
        rightHand,
    };
}

export type GreaterThan = {
    kind: "GreaterThan";
    leftHand: Expression;
    rightHand: Expression;
};

export function GreaterThan(
    leftHand: Expression,
    rightHand: Expression
): GreaterThan {
    return {
        kind: "GreaterThan",
        leftHand,
        rightHand,
    };
}

export type GreaterThanOrEqual = {
    kind: "GreaterThanOrEqual";
    leftHand: Expression;
    rightHand: Expression;
};

export function GreaterThanOrEqual(
    leftHand: Expression,
    rightHand: Expression
): GreaterThanOrEqual {
    return {
        kind: "GreaterThanOrEqual",
        leftHand,
        rightHand,
    };
}

export type Expression =
    | IfStatement
    | CaseStatement
    | Addition
    | Subtraction
    | Multiplication
    | Division
    | LeftPipe
    | RightPipe
    | ModuleReference
    | FunctionCall
    | Lambda
    | Constructor
    | StringValue
    | FormatStringValue
    | ListValue
    | Equality
    | InEquality
    | LessThan
    | LessThanOrEqual
    | GreaterThan
    | GreaterThanOrEqual
    | ObjectLiteral
    | Value;

export type SimpleValue =
    | "StringValue"
    | "FormatStringValue"
    | "ListValue"
    | "Value"
    | "Addition"
    | "Subtraction"
    | "Multiplication"
    | "Division"
    | "Lambda"
    | "Equality"
    | "InEquality"
    | "LessThan"
    | "LessThanOrEqual"
    | "GreaterThan"
    | "GreaterThanOrEqual";

export function isSimpleValue(kind: string): kind is SimpleValue {
    return (
        [
            "StringValue",
            "FormatStringValue",
            "ListValue",
            "Value",
            "Addition",
            "Subtraction",
            "Multiplication",
            "Division",
            "Lambda",
            "Equality",
            "InEquality",
            "LessThan",
            "LessThanOrEqual",
            "GreaterThan",
            "GreaterThanOrEqual",
        ].indexOf(kind) > -1
    );
}

export type LeftPipeableExpression =
    | LeftPipe
    | ModuleReference
    | FunctionCall
    | Value;

export function isLeftPipeableExpression(
    expression: Expression
): expression is LeftPipeableExpression {
    return (
        [ "LeftPipe", "ModuleReference", "FunctionCall", "Value" ].indexOf(
            expression.kind
        ) > -1
    );
}

export type Function = {
    kind: "Function";
    name: string;
    returnType: Type;
    args: FunctionArgsUnion[];
    body: Expression;
};

export function Function(
    name: string,
    returnType: Type,
    args: FunctionArgsUnion[],
    body: Expression
): Function {
    return {
        kind: "Function",
        name,
        returnType,
        args,
        body,
    };
}

export type Const = {
    kind: "Const";
    name: string;
    type: Type;
    value: Expression;
};

export function Const(name: string, type: Type, value: Expression): Const {
    return {
        kind: "Const",
        name,
        type,
        value,
    };
}

export type Import = {
    kind: "Import";
    moduleNames: string[];
};

export function Import(moduleNames: string[]): Import {
    return {
        kind: "Import",
        moduleNames,
    };
}

export type UnparsedBlockTypes =
    | "ImportBlock"
    | "UnionTypeBlock"
    | "TypeAliasBlock"
    | "FunctionBlock"
    | "ConstBlock"
    | "UnknownBlock";

export type UnparsedBlock = {
    kind: UnparsedBlockTypes;
    lineStart: number;
    lines: string[];
};

export function UnparsedBlock(
    kind: UnparsedBlockTypes,
    lineStart: number,
    lines: string[]
): UnparsedBlock {
    return {
        kind,
        lineStart,
        lines,
    };
}

export type BlockKinds =
    | "Import"
    | "UnionType"
    | "TypeAlias"
    | "Function"
    | "Const"
    | "Indent"
    | "Definition"
    | "Unknown";

export type Block = UnionType | TypeAlias | Function | Const | Import;

export type Module = {
    kind: "Module";
    name: string;
    body: Block[];
    errors: string[];
};

export function Module(name: string, body: Block[], errors: string[]): Module {
    return {
        kind: "Module",
        name,
        body,
        errors,
    };
}
