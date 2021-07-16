import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import {
    Function,
    FunctionArg,
    IfStatement,
    Module,
    Tag,
    Type,
    UnionType,
    Value,
} from "./types";

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

export function testIntoBlocksSimpleFunctionOneLine() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value = if value then true else false
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

export function testBlockKindSimpleFunctionOneLine() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value = if value then true else false
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
            [
                Function(
                    "isTrue",
                    Type("boolean", [ ]),
                    [ FunctionArg("value", Type("boolean", [ ])) ],
                    IfStatement(Value("value"), Value("true"), Value("false"))
                ),
            ],
            [ ]
        )
    );
}

export function testParseSimpleFunctionOneLine() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value = if value then true else false
`.trim();

    assert.deepStrictEqual(
        parse(simpleFunction),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    Type("boolean", [ ]),
                    [ FunctionArg("value", Type("boolean", [ ])) ],
                    IfStatement(Value("value"), Value("true"), Value("false"))
                ),
            ],
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
    const generated = generateTypescript(parsed);
    assert.strictEqual(
        generated,
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

export function testGenerateSimpleFunctionOneLine() {
    const simpleFunction = `
isTrue: boolean -> boolean
isTrue value = if value then true else false
`.trim();

    const parsed = parse(simpleFunction);
    const generated = generateTypescript(parsed);
    assert.strictEqual(
        generated,
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
