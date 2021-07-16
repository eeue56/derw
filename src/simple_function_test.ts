import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { Function, Module, Tag, Type, UnionType, Value } from "./types";

import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

export function testIntoBlocksSimpleFunction() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value =
    if value then
        true
    else
        false
`.trim();

    assert.deepStrictEqual(intoBlocks(simpleFunction), [ simpleFunction ]);
}

export function testBlockKindSimpleFunction() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value =
    if value then
        true
    else
        false
`.trim();

    assert.deepStrictEqual(blockKind(simpleFunction), Ok("Function"));
}

export function testParseSimpleFunction() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value =
    if value then
        true
    else
        false
`.trim();

    assert.deepStrictEqual(
        parse(simpleFunction),
        Module(
            "main",
            [ Function("isTrue", Type("boolean", [ ]), [ ], Value("")) ],
            [ ]
        )
    );
}

export function testGenerateSimpleFunction() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value =
    if value then
        true
    else
        false
`.trim();

    const parsed = parse(simpleFunction);
    assert.strictEqual(
        generateTypescript(parsed),
        `
function isTrue(value: boolean): boolean {
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim()
    );
}
