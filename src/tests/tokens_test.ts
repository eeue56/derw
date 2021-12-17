import * as assert from "@eeue56/ts-assert";
import {
    ArrowToken,
    AssignToken,
    CloseBracketToken,
    CloseCurlyBracesToken,
    ColonToken,
    CommaToken,
    IdentifierToken,
    KeywordToken,
    LiteralToken,
    OpenBracketToken,
    OpenCurlyBracesToken,
    OperatorToken,
    PipeToken,
    StringToken,
    tokenize,
} from "../tokens";

export function testString() {
    const str = `"hello"`;
    assert.deepStrictEqual(tokenize(str), [ StringToken(`"hello"`) ]);
}

export function testNestedString() {
    const str = `"\\"hello\\""`;
    assert.deepStrictEqual(tokenize(str), [ StringToken(`"\\"hello\\""`) ]);
}

export function testInt() {
    const str = `1`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken(`1`) ]);
}

export function testFloat() {
    const str = `3.14`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken(`3.14`) ]);
}

export function testArray() {
    const str = `[ 1, 2 ]`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken("[ 1, 2 ]") ]);
}

export function testNestedArray() {
    const str = `[ [ 1, 2 ], [ 3, 4 ] ]`;
    assert.deepStrictEqual(tokenize(str), [
        LiteralToken("[ [ 1, 2 ], [ 3, 4 ] ]"),
    ]);
}

export function testRange() {
    const str = `[ 1..2 ]`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken("[ 1..2 ]") ]);
}

export function testTrue() {
    const str = `true`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken("true") ]);
}

export function testFalse() {
    const str = `false`;
    assert.deepStrictEqual(tokenize(str), [ LiteralToken("false") ]);
}

export function testBrackets() {
    const str = `(x + y) + z`;
    assert.deepStrictEqual(tokenize(str), [
        OpenBracketToken(),
        IdentifierToken("x"),
        OperatorToken("+"),
        IdentifierToken("y"),
        CloseBracketToken(),
        OperatorToken("+"),
        IdentifierToken("z"),
    ]);
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
            IdentifierToken("x"),
            OperatorToken(op),
            IdentifierToken("y"),
        ]);
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
        KeywordToken("if"),
        LiteralToken("true"),
        OperatorToken("=="),
        LiteralToken("true"),
        KeywordToken("then"),
        IdentifierToken("x"),
        KeywordToken("else"),
        IdentifierToken("y"),
    ]);
}

export function testFunction() {
    const str = `
isTrue: boolean -> boolean
isTrue x =
    if x == x then
        true
    else
        false
`;

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken("isTrue"),
        ColonToken(),
        IdentifierToken("boolean"),
        ArrowToken(),
        IdentifierToken("boolean"),
        IdentifierToken("isTrue"),
        IdentifierToken("x"),
        AssignToken(),
        KeywordToken("if"),
        IdentifierToken("x"),
        OperatorToken("=="),
        IdentifierToken("x"),
        KeywordToken("then"),
        LiteralToken("true"),
        KeywordToken("else"),
        LiteralToken("false"),
    ]);
}

export function testUnionType() {
    const str = `
type Result a e =
    Ok { value: a }
    | Err { error: e }
`;

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken("type"),
        IdentifierToken("Result"),
        IdentifierToken("a"),
        IdentifierToken("e"),
        AssignToken(),
        IdentifierToken("Ok"),
        OpenCurlyBracesToken(),
        IdentifierToken("value"),
        ColonToken(),
        IdentifierToken("a"),
        CloseCurlyBracesToken(),
        PipeToken(),
        IdentifierToken("Err"),
        OpenCurlyBracesToken(),
        IdentifierToken("error"),
        ColonToken(),
        IdentifierToken("e"),
        CloseCurlyBracesToken(),
    ]);
}

export function testTypeAlias() {
    const str = `
type alias Person = {
    name: string,
    age: number
}
`;

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken("type"),
        KeywordToken("alias"),
        IdentifierToken("Person"),
        AssignToken(),
        OpenCurlyBracesToken(),
        IdentifierToken("name"),
        ColonToken(),
        IdentifierToken("string"),
        CommaToken(),
        IdentifierToken("age"),
        ColonToken(),
        IdentifierToken("number"),
        CloseCurlyBracesToken(),
    ]);
}

export function testImport() {
    const str = `
import fs
`;

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken("import"),
        IdentifierToken("fs"),
    ]);
}

export function testExport() {
    const str = `
exposing (isTrue, isFalse)
`;

    assert.deepStrictEqual(tokenize(str), [
        KeywordToken("exposing"),
        OpenBracketToken(),
        IdentifierToken("isTrue"),
        CommaToken(),
        IdentifierToken("isFalse"),
        CloseBracketToken(),
    ]);
}

export function testConst() {
    const str = `
names: List (List string)
names =
    [ ["noah"], ["david"] ]
`;

    assert.deepStrictEqual(tokenize(str), [
        IdentifierToken("names"),
        ColonToken(),
        IdentifierToken("List"),
        OpenBracketToken(),
        IdentifierToken("List"),
        IdentifierToken("string"),
        CloseBracketToken(),
        IdentifierToken("names"),
        AssignToken(),
        LiteralToken(`[ ["noah"], ["david"] ]`),
    ]);
}
