import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { Module, Tag, Type, UnionType } from "./types";

import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

export function testIntoBlocksSimpleUnion() {
    const simpleUnion = `
type Binary = True | False
`.trim();

    assert.deepStrictEqual(intoBlocks(simpleUnion), [ simpleUnion ]);
}

export function testIntoBlocksMultiLineUnion() {
    const simpleUnion = `
type Binary
    = True
    | False
`.trim();

    assert.deepStrictEqual(intoBlocks(simpleUnion), [ simpleUnion ]);
}

export function testBlockKindSimpleUnion() {
    const simpleUnion = `
type Binary = True | False
`.trim();

    assert.deepStrictEqual(blockKind(simpleUnion), Ok("UnionType"));
}

export function testBlockKindMultiLineUnion() {
    const simpleUnion = `
type Binary
    = True
    | False
`.trim();

    assert.deepStrictEqual(blockKind(simpleUnion), Ok("UnionType"));
}

export function testParseSimpleUnion() {
    const simpleUnion = `
type Binary = True | False
`.trim();

    assert.deepStrictEqual(
        parse(simpleUnion),
        Module(
            "main",
            [
                UnionType(Type("Binary", [ ]), [
                    Tag("True", [ ]),
                    Tag("False", [ ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testParseMultiLineUnion() {
    const simpleUnion = `
type Binary
    = True
    | False
`.trim();

    assert.deepStrictEqual(
        parse(simpleUnion),
        Module(
            "main",
            [
                UnionType(Type("Binary", [ ]), [
                    Tag("True", [ ]),
                    Tag("False", [ ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testGenerateSimpleUnion() {
    const simpleUnion = `
type Binary = True | False
`.trim();

    const parsed = parse(simpleUnion);
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

export function testGenerateMultiLineUnion() {
    const simpleUnion = `
type Binary
    = True
    | False
`.trim();

    const parsed = parse(simpleUnion);
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
