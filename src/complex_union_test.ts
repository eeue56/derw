import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { FixedType, Module, Tag, TagArg, Type, UnionType } from "./types";
import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

const oneLine = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

const multiLine = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

const expectedOutput = `
type Dog = {
    kind: "Dog";
    name: string;
}

function Dog(args: { name: string }): Dog {
    return {
        kind: "Dog",
        ...args
    }
}

type Cat = {
    kind: "Cat";
    lives: number;
}

function Cat(args: { lives: number }): Cat {
    return {
        kind: "Cat",
        ...args
    }
}

type Animal = Dog | Cat;`.trim();

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
                UnionType(FixedType("Animal", [ ]), [
                    Tag("Dog", [ TagArg("name", FixedType("string", [ ])) ]),
                    Tag("Cat", [ TagArg("lives", FixedType("number", [ ])) ]),
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
                UnionType(FixedType("Animal", [ ]), [
                    Tag("Dog", [ TagArg("name", FixedType("string", [ ])) ]),
                    Tag("Cat", [ TagArg("lives", FixedType("number", [ ])) ]),
                ]),
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
