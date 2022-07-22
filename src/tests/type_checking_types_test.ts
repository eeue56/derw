import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseBlock } from "../parser";
import { Block, FixedType, UnparsedBlock } from "../types";
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
