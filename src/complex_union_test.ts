import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { Module, Tag, TagArg, Type, UnionType } from "./types";
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

function Dog(name: string): Dog {
    return {
        kind: "Dog",
        name
    }
}

type Cat = {
    kind: "Cat";
    lives: number;
}

function Cat(lives: number): Cat {
    return {
        kind: "Cat",
        lives
    }
}

type Animal = Dog | Cat;`.trim();

export function testIntoBlocksComplexUnion() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ oneLine ]);
}

export function testIntoBlocksMultiLineUnion() {
    assert.deepStrictEqual(intoBlocks(multiLine), [ multiLine ]);
}

export function testBlockKindComplexUnion() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("UnionType"));
}

export function testBlockKindMultiLineUnion() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("UnionType"));
}

export function testParseComplexUnion() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionType(Type("Animal", [ ]), [
                    Tag("Dog", [ TagArg("name", Type("string", [ ])) ]),
                    Tag("Cat", [ TagArg("lives", Type("number", [ ])) ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testParseMultiLineUnion() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                UnionType(Type("Animal", [ ]), [
                    Tag("Dog", [ TagArg("name", Type("string", [ ])) ]),
                    Tag("Cat", [ TagArg("lives", Type("number", [ ])) ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testGenerateComplexUnion() {
    const parsed = parse(oneLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLineUnion() {
    const parsed = parse(multiLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}
