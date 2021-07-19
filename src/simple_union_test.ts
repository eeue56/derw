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
    assert.strictEqual(
        generateTypescript(parsed),
        `
type True = {
    kind: "True";
}

function True(): True {
    return {
        kind: "True",
    }
}

type False = {
    kind: "False";
}

function False(): False {
    return {
        kind: "False",
    }
}

type Binary = True | False;
`.trim()
    );
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(
        generateTypescript(parsed),
        `
type True = {
    kind: "True";
}

function True(): True {
    return {
        kind: "True",
    }
}

type False = {
    kind: "False";
}

function False(): False {
    return {
        kind: "False",
    }
}

type Binary = True | False;
`.trim()
    );
}
