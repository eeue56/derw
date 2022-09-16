import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import {
    ArrowToken,
    AssignToken,
    BaseTypeToken,
    CloseBracketToken,
    CloseCurlyBracesToken,
    ColonToken,
    CommaToken,
    CommentToken,
    FormatStringToken,
    FunctionTypeToken,
    IdentifierToken,
    KeywordToken,
    LiteralToken,
    MultilineCommentToken,
    OpenBracketToken,
    OpenCurlyBracesToken,
    OperatorToken,
    PipeToken,
    StringToken,
    tokenize,
    tokenizeType,
    tokensToString,
    WhitespaceToken,
} from "../Tokens";

export function testString() {
    const str = `"hello"`;
    assert.deepStrictEqual(tokenize(str), [ StringToken({ body: `"hello"` }) ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testNestedString() {
    const str = `"\\"hello\\""`;
    assert.deepStrictEqual(tokenize(str), [
        StringToken({ body: `"\\"hello\\""` }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testInt() {
    const str = `1`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken({ body: `1` }) ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testFloat() {
    const str = `3.14`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken({ body: `3.14` }) ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testArray() {
    const str = `[ 1, 2 ]`;
    assert.deepStrictEqual(tokenize(str), [
        LiteralToken({ body: "[ 1, 2 ]" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testNestedArray() {
    const str = `[ [ 1, 2 ], [ 3, 4 ] ]`;
    assert.deepStrictEqual(tokenize(str), [
        LiteralToken({ body: "[ [ 1, 2 ], [ 3, 4 ] ]" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testRange() {
    const str = `[ 1..2 ]`;
    assert.deepStrictEqual(tokenize(str), [
        LiteralToken({ body: "[ 1..2 ]" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testTrue() {
    const str = `true`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken({ body: "true" }) ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testFalse() {
    const str = `false`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken({ body: "false" }) ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testBrackets() {
    const str = `( x + y ) + z`;
    assert.deepStrictEqual(tokenize(str), [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        OperatorToken({ body: "+" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "y" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        OperatorToken({ body: "+" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "z" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testOperators() {
    [
        "<",
        "<=",
        ">",
        ">=",
        "==",
        "!=",
        "-",
        "+",
        "*",
        "/",
        "|>",
        "<|",
        "&&",
        "||",
    ].forEach((op) => {
        const str = `x ${op} y`;
        assert.deepStrictEqual(tokenize(str), [
            IdentifierToken({ body: "x" }),
            WhitespaceToken({ body: " " }),
            OperatorToken({ body: op }),
            WhitespaceToken({ body: " " }),
            IdentifierToken({ body: "y" }),
        ]);
        assert.deepStrictEqual(tokensToString(tokenize(str)), str);
    });
}

export function testIf() {
    const str = `
if true == true then
    x
else
    y
            `.trim();
    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "if" }),
        WhitespaceToken({ body: " " }),
        LiteralToken({ body: "true" }),
        WhitespaceToken({ body: " " }),
        OperatorToken({ body: "==" }),
        WhitespaceToken({ body: " " }),
        LiteralToken({ body: "true" }),
        WhitespaceToken({ body: " " }),
        KeywordToken({ body: "then" }),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: "\n" }),
        KeywordToken({ body: "else" }),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "y" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testFunction() {
    const str = `
isTrue: boolean -> boolean
isTrue x =
    if x == x then
        true
    else
        false
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "isTrue" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "boolean" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "boolean" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "isTrue" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        KeywordToken({ body: "if" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        OperatorToken({ body: "==" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        KeywordToken({ body: "then" }),
        WhitespaceToken({ body: "\n        " }),
        LiteralToken({ body: "true" }),
        WhitespaceToken({ body: "\n    " }),
        KeywordToken({ body: "else" }),
        WhitespaceToken({ body: "\n        " }),
        LiteralToken({ body: "false" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testUnionType() {
    const str = `
type Result a e =
    Ok { value: a }
    | Err { error: e }
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "type" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Result" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "e" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "Ok" }),
        WhitespaceToken({ body: " " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "value" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        CloseCurlyBracesToken({}),
        WhitespaceToken({ body: "\n    " }),
        PipeToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Err" }),
        WhitespaceToken({ body: " " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "error" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "e" }),
        WhitespaceToken({ body: " " }),
        CloseCurlyBracesToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testLongUnionType() {
    const str = `
type UnparsedBlock =
    ImportBlock { lineStart: number,
        lines: List string }
    | ExportBlock { lineStart: number,
        lines: List string }
`.trim();

    // console.log(tokenize(str));
    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "type" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "UnparsedBlock" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        // import block
        IdentifierToken({ body: "ImportBlock" }),
        WhitespaceToken({ body: " " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "lineStart" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        CommaToken({}),
        WhitespaceToken({ body: "\n        " }),
        IdentifierToken({ body: "lines" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: " " }),
        CloseCurlyBracesToken({}),
        WhitespaceToken({ body: "\n    " }),
        // export block
        PipeToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "ExportBlock" }),
        WhitespaceToken({ body: " " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "lineStart" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        CommaToken({}),
        WhitespaceToken({ body: "\n        " }),
        IdentifierToken({ body: "lines" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: " " }),
        CloseCurlyBracesToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testTypeAlias() {
    const str = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "type" }),
        WhitespaceToken({ body: " " }),
        KeywordToken({ body: "alias" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Person" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: " " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "name" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        CommaToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "age" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: "\n" }),
        CloseCurlyBracesToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testImport() {
    const str = `
import fs
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "import" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fs" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testImportWithExposing() {
    const str = `
import fs exposing (exists)
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "import" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fs" }),
        WhitespaceToken({ body: " " }),
        KeywordToken({ body: "exposing" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        IdentifierToken({ body: "exists" }),
        CloseBracketToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testImportWithExposingAndNearBrackets() {
    const str = `
import fs exposing(exists)
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "import" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fs" }),
        WhitespaceToken({ body: " " }),
        KeywordToken({ body: "exposing" }),
        OpenBracketToken({}),
        IdentifierToken({ body: "exists" }),
        CloseBracketToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testExport() {
    const str = `
exposing (isTrue, isFalse)
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken({ body: "exposing" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        IdentifierToken({ body: "isTrue" }),
        CommaToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "isFalse" }),
        CloseBracketToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testConst() {
    const str = `
names: List (List string)
names =
    [ ["noah"], ["david"] ]
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "names" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        CloseBracketToken({}),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "names" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        LiteralToken({ body: `[ ["noah"], ["david"] ]` }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testFunctionArg() {
    const str = `
map: (a -> b) -> a -> b
map fn x =
    fn x
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "map" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "map" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fn" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "fn" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);

    const typeParts = tokenize(str).slice(3, 18);
    assert.deepStrictEqual(
        tokenizeType(typeParts),
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
            BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
            BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
        ])
    );
}

export function testEmptyFunctionCall() {
    const str = `
toString: Buffer -> string
toString buffer =
    buffer.toString()
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "toString" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Buffer" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "toString" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "buffer" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "buffer.toString" }),
        OpenBracketToken({}),
        CloseBracketToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testComment() {
    const str = `
-- hello
toString: Buffer -> string
toString buffer =
    -- world
    buffer.toString()
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        CommentToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "hello" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "toString" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Buffer" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "toString" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "buffer" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        CommentToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "world" }),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "buffer.toString" }),
        OpenBracketToken({}),
        CloseBracketToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testMultilineComment() {
    const str = `
{-
    hello
    world
-}
toString: Buffer -> string
toString buffer =
    buffer.toString()
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        MultilineCommentToken({ body: "{-" }),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "hello" }),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "world" }),
        WhitespaceToken({ body: "\n" }),
        MultilineCommentToken({ body: "-}" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "toString" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Buffer" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "toString" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "buffer" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "buffer.toString" }),
        OpenBracketToken({}),
        CloseBracketToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testEmptyObjectLiteral() {
    const str = `
{}
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        OpenCurlyBracesToken({}),
        CloseCurlyBracesToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testNestedObjectLiteral() {
    const str = `
toString: Buffer -> string
toString buffer =
    { name: { }, buffer: buffer }
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "toString" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Buffer" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "toString" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "buffer" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "name" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        OpenCurlyBracesToken({}),
        WhitespaceToken({ body: " " }),
        CloseCurlyBracesToken({}),
        CommaToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "buffer" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "buffer" }),
        WhitespaceToken({ body: " " }),
        CloseCurlyBracesToken({}),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testListPrepend() {
    const str = `
prepend: number -> List number
prepend x =
    x :: [ 1, 2 ]
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "prepend" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "prepend" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        OperatorToken({ body: "::" }),
        WhitespaceToken({ body: " " }),
        LiteralToken({ body: "[ 1, 2 ]" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testListPrependWithoutSpaces() {
    const str = `
prepend: number -> List number
prepend x =
    x::[ 1, 2 ]
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "prepend" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "prepend" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "x" }),
        OperatorToken({ body: "::" }),
        LiteralToken({ body: "[ 1, 2 ]" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testTypePrefix() {
    const str = `
typeOfString: number -> List number
typeOfString x =
    x :: [ 1, 2 ]
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "typeOfString" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "number" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "typeOfString" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "x" }),
        WhitespaceToken({ body: " " }),
        OperatorToken({ body: "::" }),
        WhitespaceToken({ body: " " }),
        LiteralToken({ body: "[ 1, 2 ]" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testKeywordFollowedByDot() {
    const str = `
typeOfString: fn -> void
typeOfString fn =
    promise.then fn
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "typeOfString" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fn" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "void" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "typeOfString" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fn" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        IdentifierToken({ body: "promise.then" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "fn" }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}

export function testCase() {
    const str = `
sayHello: string -> string
sayHello name =
    case name of
        "Noah" -> "Hi Noah"
        \`James\` -> "Greetings"
        default -> "I don't know you"
`.trim();

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken({ body: "sayHello" }),
        ColonToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: "\n" }),
        IdentifierToken({ body: "sayHello" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "name" }),
        WhitespaceToken({ body: " " }),
        AssignToken({}),
        WhitespaceToken({ body: "\n    " }),
        KeywordToken({ body: "case" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "name" }),
        WhitespaceToken({ body: " " }),
        KeywordToken({ body: "of" }),
        WhitespaceToken({ body: "\n        " }),
        StringToken({ body: '"Noah"' }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        StringToken({ body: '"Hi Noah"' }),
        WhitespaceToken({ body: "\n        " }),
        FormatStringToken({ body: "`James`" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        StringToken({ body: '"Greetings"' }),
        WhitespaceToken({ body: "\n        " }),
        IdentifierToken({ body: "default" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        StringToken({ body: '"I don\'t know you"' }),
    ]);
    assert.deepStrictEqual(tokensToString(tokenize(str)), str);
}
