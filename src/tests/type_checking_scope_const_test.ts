import * as assert from "@eeue56/ts-assert";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks } from "../Blocks";
import { parseBlock } from "../parser";
import { Block, FixedType, GenericType, Property, TypeAlias } from "../types";
import { getValuesInTopLevelScope, validateType } from "../type_checking";

export async function testEmptyList() {
    const exampleBlocksInScope = `
emptyList: List any
emptyList =
    [ ]
    `;

    const exampleInput = `
value: List any
value =
    emptyList
`.trim();
    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [], [], valuesInScope),
        Ok(FixedType("List", [GenericType("any")]))
    );
}

export async function testInvalidEmptyList() {
    const exampleBlocksInScope = `
emptyList: boolean
emptyList =
    true
    `;

    const exampleInput = `
value: List any
value =
    emptyList
`.trim();
    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [], [], valuesInScope),
        Err("Expected `List (any)` but got `boolean`")
    );
}

export async function testMissingEmptyList() {
    const exampleBlocksInScope = `
    `;

    const exampleInput = `
value: List any
value =
    emptyList
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [], [], valuesInScope),
        Ok(FixedType("List", [GenericType("any")]))
    );
}

export async function testObjectLiteral() {
    const exampleBlocksInScope = `
name: string
name =
    "Noah"
    `;

    const exampleInput = `
value: Person
value =
    {
        name: name,
        age: 28
    }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                ]),
            ],
            [],
            valuesInScope
        ),
        Ok(FixedType("Person", []))
    );
}

export async function testInvalidObjectLiteral() {
    const exampleBlocksInScope = `
name: boolean
name =
    true
    `;

    const exampleInput = `
value: Person
value =
    {
        name: name,
        age: 28
    }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                ]),
            ],
            [],
            valuesInScope
        ),
        Err(
            "Mismatching type for type alias Person\nInvalid properties: name: Expected string but got boolean"
        )
    );
}

export async function testIfStatement() {
    const exampleBlocksInScope = `
name: string
name =
    "Noah"
    `;

    const exampleInput = `
value: Person
value =
    if true then
        {
            name: name,
            age: 28
        }
    else
        {
            name: "hm",
            age: 28
        }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                ]),
            ],
            [],
            valuesInScope
        ),
        Ok(FixedType("Person", []))
    );
}

export async function testInvalidIfStatement() {
    const exampleBlocksInScope = `
name: boolean
name =
    true
    `;

    const exampleInput = `
value: Person
value =
    if true then
        {
            name: name,
            age: 28
        }
    else
        {
            name: "hm",
            age: 28
        }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                ]),
            ],
            [],
            valuesInScope
        ),
        Err("Conflicting types: { name: boolean, age: number }, Person")
    );
}

export async function testCaseStatement() {
    const exampleBlocksInScope = `
name: string
name =
    "Noah"
    `;

    const exampleInput = `
value: Person
value =
    case str of
        "" ->
            {
                name: name,
                age: 28
            }

        default ->
            {
                name: "hm",
                age: 28
            }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                ]),
            ],
            [],
            valuesInScope
        ),
        Ok(FixedType("Person", []))
    );
}

export async function testInvalidCaseStatement() {
    const exampleBlocksInScope = `
name: boolean
name =
    true
    `;

    const exampleInput = `
value: Person
value =
    case str of
        "" ->
            {
                name: name,
                age: 28
            }

        default ->
            {
                name: "hm",
                age: 28
            }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                ]),
            ],
            [],
            valuesInScope
        ),
        Err("Conflicting types: { name: boolean, age: number }, Person")
    );
}
