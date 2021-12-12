import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseExpression } from "../parser";
import { Expression, FixedType } from "../types";
import { inferType } from "../type_checking";

export async function testEmptyList() {
    const exampleInput = `
[ ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value),
        FixedType("List", [ FixedType("any", [ ]) ])
    );
}

export async function testStringList() {
    const exampleInput = `
[ "hello", "world" ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value),
        FixedType("List", [ FixedType("string", [ ]) ])
    );
}

export async function testNumberList() {
    const exampleInput = `
[ 1, 2 ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value),
        FixedType("List", [ FixedType("number", [ ]) ])
    );
}

export async function testListRange() {
    const exampleInput = `
[ 1..2 ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value),
        FixedType("List", [ FixedType("number", [ ]) ])
    );
}

export async function testString() {
    const exampleInput = `
"hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("string", [ ]));
}

export async function testFormatString() {
    const exampleInput = `
\`hello\`
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("string", [ ]));
}

export async function testObjectLiteral() {
    const exampleInput = `
{
    name: "noah",
    age: 28
}
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testIfStatement() {
    const exampleInput = `
if true then
    "hello"
else
    "world"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("string", [ ]));
}

export async function testMultiIfStatement() {
    const exampleInput = `
if true then
    "hello"
else
    1
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testCaseStatement() {
    const exampleInput = `
case x of
    Dog { name } -> "hello"
    Cat { name } -> "world"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("string", [ ]));
}

export async function testMultiStatement() {
    const exampleInput = `
case x of
    Dog { name } -> "hello"
    Cat { name } -> 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testAddition() {
    const exampleInput = `
1 + 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("number", [ ]));
}

export async function testMultiAddition() {
    const exampleInput = `
1 + "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testSubtraction() {
    const exampleInput = `
1 - 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("number", [ ]));
}

export async function testMultiSubtraction() {
    const exampleInput = `
1 - "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testMultiplication() {
    const exampleInput = `
1 * 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("number", [ ]));
}

export async function testMultiMultiplication() {
    const exampleInput = `
1 * "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testDivision() {
    const exampleInput = `
1 / 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("number", [ ]));
}

export async function testMultiDivision() {
    const exampleInput = `
1 / "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("any", [ ]));
}

export async function testEquality() {
    const exampleInput = `
1 == 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("boolean", [ ]));
}

export async function testInEquality() {
    const exampleInput = `
1 != 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("boolean", [ ]));
}

export async function testLessThan() {
    const exampleInput = `
1 < 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("boolean", [ ]));
}

export async function testLessThanOrEqual() {
    const exampleInput = `
1 <= 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("boolean", [ ]));
}

export async function testGreaterThan() {
    const exampleInput = `
1 > 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("boolean", [ ]));
}

export async function testGreaterThanOrEqual() {
    const exampleInput = `
1 >= 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(inferType(value), FixedType("boolean", [ ]));
}
