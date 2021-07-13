import {
    blockKind,
    generateTypescript,
    intoBlocks,
    Module,
    parse,
    Tag,
    TagArg,
    UnionType,
} from "./derw";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

export function testIntoBlocksComplexUnion() {
    const ComplexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(intoBlocks(ComplexUnion), [ ComplexUnion ]);
}

export function testIntoBlocksMultiLineUnion() {
    const ComplexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(intoBlocks(ComplexUnion), [ ComplexUnion ]);
}

export function testBlockKindComplexUnion() {
    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(blockKind(complexUnion), Ok("UnionType"));
}

export function testBlockKindMultiLineUnion() {
    const complexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(blockKind(complexUnion), Ok("UnionType"));
}

export function testParseComplexUnion() {
    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(
        parse(complexUnion),
        Module(
            "main",
            [
                UnionType("Animal", [
                    Tag("Dog", [ TagArg("name", "string") ]),
                    Tag("Cat", [ TagArg("lives", "number") ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testParseMultiLineUnion() {
    const complexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(
        parse(complexUnion),
        Module(
            "main",
            [
                UnionType("Animal", [
                    Tag("Dog", [ TagArg("name", "string") ]),
                    Tag("Cat", [ TagArg("lives", "number") ]),
                ]),
            ],
            [ ]
        )
    );
}

export function testGenerateComplexUnion() {
    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    const parsed = parse(complexUnion);

    assert.deepStrictEqual(
        generateTypescript(parsed),
        `
type Dog {
    kind: "Dog";
    name: string;
}

function Dog(name): Dog {
    return {
        kind: "Dog",
        name
    }
}

type Cat {
    kind: "Cat";
    lives: number;
}

function Cat(lives): Cat {
    return {
        kind: "Cat",
        lives
    }
}

type Animal = Dog | Cat`.trim()
    );
}

export function testGenerateMultiLineUnion() {
    const complexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    const parsed = parse(complexUnion);

    assert.deepStrictEqual(
        generateTypescript(parsed),
        `
type Dog {
    kind: "Dog";
    name: string;
}

function Dog(name): Dog {
    return {
        kind: "Dog",
        name
    }
}

type Cat {
    kind: "Cat";
    lives: number;
}

function Cat(lives): Cat {
    return {
        kind: "Cat",
        lives
    }
}

type Animal = Dog | Cat`.trim()
    );
}
