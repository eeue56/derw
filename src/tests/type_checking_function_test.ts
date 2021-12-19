import * as assert from "@eeue56/ts-assert";
import { Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseBlock } from "../parser";
import {
    Block,
    FixedType,
    GenericType,
    Import,
    ImportModule,
    UnparsedBlock,
} from "../types";
import { validateType } from "../type_checking";

export async function testEmptyList() {
    const exampleInput = `
value: boolean -> List any
value a = [ ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> List string
value a = [ "hello", "world" ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> List number
value a = [ 1, 2 ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> List number
value a = [ 1..2 ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: List number -> string
value a =
    "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
        Ok(FixedType("string", [ ]))
    );
}

export async function testFormatString() {
    const exampleInput = `
value: Result string string -> string
value a =
    \`hello\`
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Result", Nothing(), [ "Result" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("string", [ ]))
    );
}

export async function testObjectLiteral() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> string
value a =
    if true == a then
        "hello"
    else
        "world"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: any -> any
value a =
    if true then
        "hello"
    else
        1
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(GenericType("any"))
    );
}

export async function testCaseStatement() {
    const exampleInput = `
value: Animal -> string
value x =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> "world"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Animal", Nothing(), [ "Animal" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiStatement() {
    const exampleInput = `
value: Animal -> any
value x =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Animal", Nothing(), [ "Animal" ], "Global"),
                ]),
            ]
        ),
        Ok(GenericType("any"))
    );
}

export async function testAddition() {
    const exampleInput = `
value: boolean -> number
value a =
    1 + 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> any
value a =
    1 + "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(GenericType("any"))
    );
}

export async function testSubtraction() {
    const exampleInput = `
value: boolean -> number
value a =
    1 - 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> any
value a =
    1 - "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(GenericType("any"))
    );
}

export async function testMultiplication() {
    const exampleInput = `
value: a -> number
value a =
    1 * 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> any
value a =
    1 * "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(GenericType("any"))
    );
}

export async function testDivision() {
    const exampleInput = `
value: boolean -> number
value a =
    1 / 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> any
value a =
    1 / "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(GenericType("any"))
    );
}

export async function testEquality() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 == 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> boolean
value a =
    1 != 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> boolean
value a =
    1 < 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> boolean
value a =
    1 <= 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> boolean
value a =
    1 > 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
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
value: boolean -> boolean
value a =
    1 >= 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}
