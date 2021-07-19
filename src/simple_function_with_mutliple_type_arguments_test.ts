import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import {
    FixedType,
    Function,
    FunctionArg,
    GenericType,
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

const oneLine = `
isTrue: Maybe a -> Maybe b
isTrue value = if value then value else value
`.trim();

const multiLine = `
isTrue: Maybe a -> Maybe b
isTrue value =
    if value then
        value
    else
        value
`.trim();

const expectedOutput = `
function isTrue<a, b>(value: Maybe<a>): Maybe<b> {
    if (value) {
        return value;
    } else {
        return value;
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ oneLine ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [ multiLine ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    FixedType("Maybe", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    IfStatement(Value("value"), Value("value"), Value("value"))
                ),
            ],
            [ ]
        )
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    FixedType("Maybe", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    IfStatement(Value("value"), Value("value"), Value("value"))
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}
