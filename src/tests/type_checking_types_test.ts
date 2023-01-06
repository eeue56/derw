import * as assert from "@eeue56/ts-assert";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseBlock } from "../parser";
import { Block, FixedType, TypedBlock, UnparsedBlock } from "../types";
import { validateType } from "../type_checking";

export async function testUnionType() {
    const exampleInput = `
type Animal =
    Dog { name: string }
    | Cat { name: string }
`.trim();
    const block = UnparsedBlock("UnionTypeBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("Animal", [ ]))
    );
}

export async function testTypeAlias() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();
    const block = UnparsedBlock("TypeAliasBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testTypeAliasAgainstObjectLiteral() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    const exampleInstance = `
person: Person
person =
    { name: "hello", age: 2 }
`.trim();

    const unparsedTypeBlock = UnparsedBlock(
        "TypeAliasBlock",
        0,
        exampleInput.split("\n")
    );
    const parsedTypeBlock = parseBlock(unparsedTypeBlock);
    assert.deepStrictEqual(parsedTypeBlock.kind, "Ok");
    const typeValue = (parsedTypeBlock as Ok<Block>).value as TypedBlock;

    const unparsedInstance = UnparsedBlock(
        "ConstBlock",
        0,
        exampleInstance.split("\n")
    );
    const parsedInstance = parseBlock(unparsedInstance);
    assert.deepStrictEqual(parsedInstance.kind, "Ok");
    const instanceValue = (parsedInstance as Ok<Block>).value as TypedBlock;

    assert.deepStrictEqual(
        validateType(instanceValue, [ typeValue ], [ ]),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testTypeAliasAgainstObjectLiteralWithMissingProperties() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    const exampleInstance = `
person: Person
person =
    { name: "hello" }
`.trim();

    const unparsedTypeBlock = UnparsedBlock(
        "TypeAliasBlock",
        0,
        exampleInput.split("\n")
    );
    const parsedTypeBlock = parseBlock(unparsedTypeBlock);
    assert.deepStrictEqual(parsedTypeBlock.kind, "Ok");
    const typeValue = (parsedTypeBlock as Ok<Block>).value as TypedBlock;

    const unparsedInstance = UnparsedBlock(
        "ConstBlock",
        0,
        exampleInstance.split("\n")
    );
    const parsedInstance = parseBlock(unparsedInstance);
    assert.deepStrictEqual(parsedInstance.kind, "Ok");
    const instanceValue = (parsedInstance as Ok<Block>).value as TypedBlock;

    assert.deepStrictEqual(
        validateType(instanceValue, [ typeValue ], [ ]),
        Err(
            "Mismatching type for type alias Person\n" +
                "The type alias had these properties which are missing in this object literal: age: number"
        )
    );
}

export async function testTypeAliasAgainstObjectLiteralWithAdditionalProperties() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    const exampleInstance = `
person: Person
person =
    { name: "hello", age: 2, label: "Mr" }
`.trim();

    const unparsedTypeBlock = UnparsedBlock(
        "TypeAliasBlock",
        0,
        exampleInput.split("\n")
    );
    const parsedTypeBlock = parseBlock(unparsedTypeBlock);
    assert.deepStrictEqual(parsedTypeBlock.kind, "Ok");
    const typeValue = (parsedTypeBlock as Ok<Block>).value as TypedBlock;

    const unparsedInstance = UnparsedBlock(
        "ConstBlock",
        0,
        exampleInstance.split("\n")
    );
    const parsedInstance = parseBlock(unparsedInstance);
    assert.deepStrictEqual(parsedInstance.kind, "Ok");
    const instanceValue = (parsedInstance as Ok<Block>).value as TypedBlock;

    assert.deepStrictEqual(
        validateType(instanceValue, [ typeValue ], [ ]),
        Err(
            "Mismatching type for type alias Person\n" +
                "The object literal had these properties which aren't in the type alias: label: string"
        )
    );
}

export async function testTypeAliasAgainstObjectLiteralWithAdditionalAndMissingProperties() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    const exampleInstance = `
person: Person
person =
    { name: "hello", label: "Mr" }
`.trim();

    const unparsedTypeBlock = UnparsedBlock(
        "TypeAliasBlock",
        0,
        exampleInput.split("\n")
    );
    const parsedTypeBlock = parseBlock(unparsedTypeBlock);
    assert.deepStrictEqual(parsedTypeBlock.kind, "Ok");
    const typeValue = (parsedTypeBlock as Ok<Block>).value as TypedBlock;

    const unparsedInstance = UnparsedBlock(
        "ConstBlock",
        0,
        exampleInstance.split("\n")
    );
    const parsedInstance = parseBlock(unparsedInstance);
    assert.deepStrictEqual(parsedInstance.kind, "Ok");
    const instanceValue = (parsedInstance as Ok<Block>).value as TypedBlock;

    assert.deepStrictEqual(
        validateType(instanceValue, [ typeValue ], [ ]),
        Err(
            "Mismatching type for type alias Person\n" +
                "The type alias had these properties which are missing in this object literal: age: number\n" +
                `The object literal had these properties which aren't in the type alias: label: string`
        )
    );
}

export async function testTypeAliasAgainstObjectLiteralWithAdditionalPropertiesObject() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    const exampleInstance = `
person: Person
person =
    { name: "hello", age: 2, label: { title: "Mr" } }
`.trim();

    const unparsedTypeBlock = UnparsedBlock(
        "TypeAliasBlock",
        0,
        exampleInput.split("\n")
    );
    const parsedTypeBlock = parseBlock(unparsedTypeBlock);
    assert.deepStrictEqual(parsedTypeBlock.kind, "Ok");
    const typeValue = (parsedTypeBlock as Ok<Block>).value as TypedBlock;

    const unparsedInstance = UnparsedBlock(
        "ConstBlock",
        0,
        exampleInstance.split("\n")
    );
    const parsedInstance = parseBlock(unparsedInstance);
    assert.deepStrictEqual(parsedInstance.kind, "Ok");
    const instanceValue = (parsedInstance as Ok<Block>).value as TypedBlock;

    assert.deepStrictEqual(
        validateType(instanceValue, [ typeValue ], [ ]),
        Err(
            "Mismatching type for type alias Person\n" +
                "The object literal had these properties which aren't in the type alias: label: { title: string }"
        )
    );
}

export async function testTypeAliasAgainstObjectLiteralWithNestedAdditionalPropertiesObject() {
    const exampleInput = `
type alias Person = {
    name: string,
    age: number
}
`.trim();

    const exampleInstance = `
person: Person
person =
    { name: "hello", age: 2, label: { first: { title: "Mr" } } }
`.trim();

    const unparsedTypeBlock = UnparsedBlock(
        "TypeAliasBlock",
        0,
        exampleInput.split("\n")
    );
    const parsedTypeBlock = parseBlock(unparsedTypeBlock);
    assert.deepStrictEqual(parsedTypeBlock.kind, "Ok");
    const typeValue = (parsedTypeBlock as Ok<Block>).value as TypedBlock;

    const unparsedInstance = UnparsedBlock(
        "ConstBlock",
        0,
        exampleInstance.split("\n")
    );
    const parsedInstance = parseBlock(unparsedInstance);
    assert.deepStrictEqual(parsedInstance.kind, "Ok");
    const instanceValue = (parsedInstance as Ok<Block>).value as TypedBlock;

    assert.deepStrictEqual(
        validateType(instanceValue, [ typeValue ], [ ]),
        Err(
            "Mismatching type for type alias Person\n" +
                "The object literal had these properties which aren't in the type alias: label: { first: { title: string } }"
        )
    );
}
