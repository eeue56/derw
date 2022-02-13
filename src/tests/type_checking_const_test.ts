import * as assert from "@eeue56/ts-assert";
import { Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseBlock } from "../parser";
import {
    Block,
    FixedType,
    GenericType,
    Import,
    ImportModule,
    Property,
    Tag,
    TagArg,
    TypeAlias,
    UnionType,
    UnparsedBlock,
} from "../types";
import { validateType } from "../type_checking";

export async function testEmptyList() {
    const exampleInput = `
value: List any
value = [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ GenericType("any") ]))
    );
}

export async function testStringList() {
    const exampleInput = `
value: List string
value = [ "hello", "world" ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("string", [ ]) ]))
    );
}

export async function testNumberList() {
    const exampleInput = `
value: List number
value = [ 1, 2 ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testListRange() {
    const exampleInput = `
value: List number
value = [ 1..2 ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testString() {
    const exampleInput = `
value: string
value =
    "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testFormatString() {
    const exampleInput = `
value: string
value =
    \`hello\`
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testObjectLiteral() {
    const exampleInput = `
value: Person
value =
    {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Person", Nothing(), [ "Person" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testIfStatement() {
    const exampleInput = `
value: string
value =
    if true == true then
        "hello"
    else
        "world"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiIfStatement() {
    const exampleInput = `
value: any
value =
    if true then
        "hello"
    else
        1
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Conflicting types: string, number")
    );
}

export async function testCaseStatement() {
    const exampleInput = `
value: string
value =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> "world"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiStatement() {
    const exampleInput = `
value: any
value =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Conflicting types: string, number")
    );
}

export async function testAddition() {
    const exampleInput = `
value: number
value =
    1 + 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiAddition() {
    const exampleInput = `
value: any
value =
    1 + "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testSubtraction() {
    const exampleInput = `
value: number
value =
    1 - 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiSubtraction() {
    const exampleInput = `
value: any
value =
    1 - "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testMultiplication() {
    const exampleInput = `
value: number
value =
    1 * 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiMultiplication() {
    const exampleInput = `
value: any
value =
    1 * "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testDivision() {
    const exampleInput = `
value: number
value =
    1 / 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiDivision() {
    const exampleInput = `
value: any
value =
    1 / "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testEquality() {
    const exampleInput = `
value: boolean
value =
    1 == 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testInEquality() {
    const exampleInput = `
value: boolean
value =
    1 != 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testLessThan() {
    const exampleInput = `
value: boolean
value =
    1 < 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testLessThanOrEqual() {
    const exampleInput = `
value: boolean
value =
    1 <= 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testGreaterThan() {
    const exampleInput = `
value: boolean
value =
    1 > 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testGreaterThanOrEqual() {
    const exampleInput = `
value: boolean
value =
    1 >= 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testListPrepend() {
    const exampleInput = `
value: List number
value =
    1 :: []
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testListPrependWithValues() {
    const exampleInput = `
value: List string
value =
    "hello" :: [ "world" ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("List", [ FixedType("string", [ ]) ]))
    );
}

export async function testListPrependWithConstructor() {
    const exampleInput = `
value: List Person
value =
    Person { name: "hello" } :: [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
    );
}

export async function testListPrependWithinCaseWithConstructor() {
    const exampleInput = `
value: List Person
value =
    case "hello" of
        "hello" ->
            Person { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
    );
}

export async function testListPrependWithinCaseListWithConstructor() {
    const exampleInput = `
value: List Person
value =
    case [ "hello" ] of
        "hello" :: [] ->
            Person { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
    );
}

export async function testListPrependWithinCaseGeneralListWithConstructor() {
    const exampleInput = `
value: List Person
value =
    case [ "hello" ] of
        x :: [] ->
            Person { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("Person", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
    );
}
