import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { FixedType, Module, Tag, Type, UnionType } from "./types";

import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

const oneLine = `
type Binary = True | False
`.trim();

const multiLine = `
type Binary
    = True
    | False
`.trim();

const expectedOutput = `
type True = {
    kind: "True";
}

function True(args: {  }): True {
    return {
        kind: "True",
        ...args
    }
}

type False = {
    kind: "False";
}

function False(args: {  }): False {
    return {
        kind: "False",
        ...args
    }
}

type Binary = True | False;
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ oneLine ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [ multiLine ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("UnionType"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("UnionType"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionType(FixedType("Binary", [ ]), [
                    Tag("True", [ ]),
                    Tag("False", [ ]),
                ]),
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
                UnionType(FixedType("Binary", [ ]), [
                    Tag("True", [ ]),
                    Tag("False", [ ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}
