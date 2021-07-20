import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import {
    FixedType,
    GenericType,
    Module,
    Tag,
    TagArg,
    Type,
    UnionType,
} from "./types";
import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

const oneLine = `
type Either a b = Left { value: a } | Right { value: b }
`.trim();

const multiLine = `
type Either a b
    = Left { value: a }
    | Right { value: b }
`.trim();

const expectedOutput = `
type Left<a> = {
    kind: "Left";
    value: a;
}

function Left<a>(args: { value: a }): Left<a> {
    return {
        kind: "Left",
        ...args
    }
}

type Right<b> = {
    kind: "Right";
    value: b;
}

function Right<b>(args: { value: b }): Right<b> {
    return {
        kind: "Right",
        ...args
    }
}

type Either<a, b> = Left<a> | Right<b>;
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
                UnionType(
                    FixedType("Either", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("Left", [ TagArg("value", GenericType("a")) ]),
                        Tag("Right", [ TagArg("value", GenericType("b")) ]),
                    ]
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
                UnionType(
                    FixedType("Either", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("Left", [ TagArg("value", GenericType("a")) ]),
                        Tag("Right", [ TagArg("value", GenericType("b")) ]),
                    ]
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}
