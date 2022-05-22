import { Maybe } from "@eeue56/ts-core/build/main/lib/maybe";

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

export type FunctionType = {
    kind: "FunctionType";
    args: Type[];
};

export function FunctionType(args: Type[]): FunctionType {
    return {
        kind: "FunctionType",
        args,
    };
}

export type Type = GenericType | FixedType | FunctionType;

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
    type: FixedType;
    tags: Tag[];
};

export function UnionType(type: FixedType, tags: Tag[]): UnionType {
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
    type: FixedType;
    properties: Property[];
};

export function TypeAlias(type: FixedType, properties: Property[]): TypeAlias {
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

export type ObjectLiteralBase = Value | null;

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
    base: ObjectLiteralBase;
    fields: Field[];
};

export function ObjectLiteral(
    base: ObjectLiteralBase,
    fields: Field[]
): ObjectLiteral {
    return {
        kind: "ObjectLiteral",
        base,
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

export type ListRange = {
    kind: "ListRange";
    start: Value;
    end: Value;
};

export function ListRange(start: Value, end: Value): ListRange {
    return {
        kind: "ListRange",
        start,
        end,
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
    pattern: ObjectLiteral;
};

export function Constructor(
    constructor: string,
    pattern: ObjectLiteral
): Constructor {
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
    ifLetBody: Block[];
    elseBody: Expression;
    elseLetBody: Block[];
};

export function IfStatement(
    predicate: Expression,
    ifBody: Expression,
    ifLetBody: Block[],
    elseBody: Expression,
    elseLetBody: Block[]
): IfStatement {
    return {
        kind: "IfStatement",
        predicate,
        ifBody,
        ifLetBody,
        elseBody,
        elseLetBody,
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

export type And = {
    kind: "And";
    left: Expression;
    right: Expression;
};

export function And(left: Expression, right: Expression): And {
    return {
        kind: "And",
        left,
        right,
    };
}

export type Or = {
    kind: "Or";
    left: Expression;
    right: Expression;
};

export function Or(left: Expression, right: Expression): Or {
    return {
        kind: "Or",
        left,
        right,
    };
}

export type ListPrepend = {
    kind: "ListPrepend";
    left: Expression;
    right: Expression;
};

export function ListPrepend(left: Expression, right: Expression): ListPrepend {
    return {
        kind: "ListPrepend",
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

export type LambdaCall = {
    kind: "LambdaCall";
    args: Expression[];
    lambda: Lambda;
};

export function LambdaCall(lambda: Lambda, args: Expression[]): LambdaCall {
    return {
        kind: "LambdaCall",
        lambda,
        args,
    };
}

export type Default = {
    kind: "Default";
};

export function Default(): Default {
    return {
        kind: "Default",
    };
}

export type EmptyList = {
    kind: "EmptyList";
};

export function EmptyList(): EmptyList {
    return {
        kind: "EmptyList",
    };
}

export type ListDestructurePart =
    | Value
    | StringValue
    | FormatStringValue
    | EmptyList
    | Destructure;

export type ListDestructure = {
    kind: "ListDestructure";
    parts: ListDestructurePart[];
};

export function ListDestructure(parts: ListDestructurePart[]): ListDestructure {
    return {
        kind: "ListDestructure",
        parts,
    };
}

export type BranchPattern =
    | Default
    | Destructure
    | StringValue
    | FormatStringValue
    | EmptyList
    | ListDestructure;

export type Branch = {
    kind: "Branch";
    pattern: BranchPattern;
    body: Expression;
    letBody: Block[];
};

export function Branch(
    pattern: BranchPattern,
    body: Expression,
    letBody: Block[]
): Branch {
    return {
        kind: "Branch",
        pattern,
        body,
        letBody,
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
    left: Expression;
    right: Expression;
};

export function Equality(left: Expression, right: Expression): Equality {
    return {
        kind: "Equality",
        left: left,
        right,
    };
}

export type InEquality = {
    kind: "InEquality";
    left: Expression;
    right: Expression;
};

export function InEquality(left: Expression, right: Expression): InEquality {
    return {
        kind: "InEquality",
        left,
        right,
    };
}

export type LessThan = {
    kind: "LessThan";
    left: Expression;
    right: Expression;
};

export function LessThan(left: Expression, right: Expression): LessThan {
    return {
        kind: "LessThan",
        left,
        right,
    };
}

export type LessThanOrEqual = {
    kind: "LessThanOrEqual";
    left: Expression;
    right: Expression;
};

export function LessThanOrEqual(
    left: Expression,
    right: Expression
): LessThanOrEqual {
    return {
        kind: "LessThanOrEqual",
        left,
        right,
    };
}

export type GreaterThan = {
    kind: "GreaterThan";
    left: Expression;
    right: Expression;
};

export function GreaterThan(left: Expression, right: Expression): GreaterThan {
    return {
        kind: "GreaterThan",
        left,
        right,
    };
}

export type GreaterThanOrEqual = {
    kind: "GreaterThanOrEqual";
    left: Expression;
    right: Expression;
};

export function GreaterThanOrEqual(
    left: Expression,
    right: Expression
): GreaterThanOrEqual {
    return {
        kind: "GreaterThanOrEqual",
        left,
        right,
    };
}

export type Expression =
    | IfStatement
    | CaseStatement
    | Addition
    | Subtraction
    | Multiplication
    | Division
    | And
    | Or
    | ListPrepend
    | LeftPipe
    | RightPipe
    | ModuleReference
    | FunctionCall
    | Lambda
    | LambdaCall
    | Constructor
    | StringValue
    | FormatStringValue
    | ListValue
    | ListRange
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
    | "ListRange"
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
    | "GreaterThanOrEqual"
    | "And"
    | "Or"
    | "ListPrepend"
    | "ModuleReference"
    | "FunctionCall"
    | "LeftPipe"
    | "ObjectLiteral"
    | "Constructor";

export function isSimpleValue(kind: string): kind is SimpleValue {
    return (
        [
            "StringValue",
            "FormatStringValue",
            "ListValue",
            "ListRange",
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
            "And",
            "Or",
            "ListPrepend",
            "ModuleReference",
            "FunctionCall",
            "LeftPipe",
            "ObjectLiteral",
            "Constructor",
        ].indexOf(kind) > -1
    );
}

export type LeftPipeableExpression =
    | LeftPipe
    | ModuleReference
    | FunctionCall
    | Lambda
    | Value;

export function isLeftPipeableExpression(
    expression: Expression
): expression is LeftPipeableExpression {
    return (
        [
            "LeftPipe",
            "ModuleReference",
            "FunctionCall",
            "Lambda",
            "Value",
        ].indexOf(expression.kind) > -1
    );
}

export type Function = {
    kind: "Function";
    name: string;
    returnType: Type;
    args: FunctionArgsUnion[];
    letBody: Block[];
    body: Expression;
};

export function Function(
    name: string,
    returnType: Type,
    args: FunctionArgsUnion[],
    letBody: Block[],
    body: Expression
): Function {
    return {
        kind: "Function",
        name,
        returnType,
        args,
        letBody,
        body,
    };
}

export type Const = {
    kind: "Const";
    name: string;
    type: Type;
    letBody: Block[];
    value: Expression;
};

export function Const(
    name: string,
    type: Type,
    letBody: Block[],
    value: Expression
): Const {
    return {
        kind: "Const",
        name,
        type,
        letBody,
        value,
    };
}

export type ImportNamespace = "Global" | "Relative";

export type ImportModule = {
    kind: "ImportModule";
    name: string;
    alias: Maybe<string>;
    exposing: string[];
    namespace: ImportNamespace;
};

export function ImportModule(
    name: string,
    alias: Maybe<string>,
    exposing: string[],
    namespace: ImportNamespace
): ImportModule {
    return {
        kind: "ImportModule",
        name,
        alias,
        exposing,
        namespace,
    };
}

export type Import = {
    kind: "Import";
    modules: ImportModule[];
};

export function Import(modules: ImportModule[]): Import {
    return {
        kind: "Import",
        modules,
    };
}

export type Export = {
    kind: "Export";
    names: string[];
};

export function Export(names: string[]): Export {
    return {
        kind: "Export",
        names,
    };
}

export type Comment = {
    kind: "Comment";
};

export function Comment(): Comment {
    return {
        kind: "Comment",
    };
}

export type MultilineComment = {
    kind: "MultilineComment";
};

export function MultilineComment(): MultilineComment {
    return {
        kind: "MultilineComment",
    };
}

export type UnparsedBlockTypes =
    | "ImportBlock"
    | "ExportBlock"
    | "UnionTypeBlock"
    | "TypeAliasBlock"
    | "FunctionBlock"
    | "ConstBlock"
    | "CommentBlock"
    | "MultilineCommentBlock"
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
    | "Export"
    | "UnionType"
    | "TypeAlias"
    | "Function"
    | "Const"
    | "Indent"
    | "Definition"
    | "Comment"
    | "MultilineComment"
    | "Unknown";

export type Block =
    | UnionType
    | TypeAlias
    | Function
    | Const
    | Import
    | Export
    | Comment
    | MultilineComment;

export type TypedBlock = UnionType | TypeAlias;

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

export type ContextModule = {
    kind: "ContextModule";
    name: string;
    body: Block[];
    unparsedBody: UnparsedBlock[];
    errors: string[];
};

export function ContextModule(
    name: string,
    body: Block[],
    unparsedBody: UnparsedBlock[],
    errors: string[]
): ContextModule {
    return {
        kind: "ContextModule",
        name,
        body,
        unparsedBody,
        errors,
    };
}

export function contextModuleToModule(module: ContextModule): Module {
    return Module(module.name, module.body, module.errors);
}
