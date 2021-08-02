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

export type Expression =
    | IfStatement
    | CaseStatement
    | Addition
    | Constructor
    | StringValue
    | FormatStringValue
    | ListValue
    | Value;

export type SimpleValue =
    | "StringValue"
    | "FormatStringValue"
    | "ListValue"
    | "Value"
    | "Addition"
    | "Subtraction";

export function isSimpleValue(kind: string): kind is SimpleValue {
    return (
        [
            "StringValue",
            "FormatStringValue",
            "ListValue",
            "Value",
            "Addition",
            "Subtraction",
        ].indexOf(kind) > -1
    );
}

export type Function = {
    kind: "Function";
    name: string;
    returnType: Type;
    args: FunctionArg[];
    body: Expression;
};

export function Function(
    name: string,
    returnType: Type,
    args: FunctionArg[],
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

export type UnparsedBlockTypes =
    | "TypeBlock"
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
    | "UnionType"
    | "Function"
    | "Const"
    | "Indent"
    | "Definition";

export type Block = UnionType | Function | Const;

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
