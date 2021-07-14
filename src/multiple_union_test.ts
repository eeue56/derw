import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { Module, Tag, TagArg, UnionType } from "./types";
import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

export function testIntoBlocks() {
    const simpleUnion = `
type Binary = True | False
`.trim();
    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(intoBlocks(simpleUnion + "\n\n" + complexUnion), [
        simpleUnion,
        complexUnion,
    ]);
}

export function testIntoBlocksMultiLineUnion() {
    const simpleUnion = `
type Binary
    = True
    | False
    `.trim();

    const complexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(intoBlocks(simpleUnion + "\n\n" + complexUnion), [
        simpleUnion,
        complexUnion,
    ]);
}

export function testParseComplexUnion() {
    const simpleUnion = `
type Binary = True | False
`.trim();

    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(
        parse(simpleUnion + "\n\n" + complexUnion),
        Module(
            "main",
            [
                UnionType("Binary", [ Tag("True", [ ]), Tag("False", [ ]) ]),
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
    const simpleUnion = `
type Binary
    = True
    | False
    `.trim();

    const complexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(
        parse(simpleUnion + "\n\n" + complexUnion),
        Module(
            "main",
            [
                UnionType("Binary", [ Tag("True", [ ]), Tag("False", [ ]) ]),
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
    const simpleUnion = `
type Binary = True | False
`.trim();

    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    const parsed = parse(simpleUnion + "\n\n" + complexUnion);

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

type Dog = {
    kind: "Dog";
    name: string;
}

function Dog(name): Dog {
    return {
        kind: "Dog",
        name
    }
}

type Cat = {
    kind: "Cat";
    lives: number;
}

function Cat(lives): Cat {
    return {
        kind: "Cat",
        lives
    }
}

type Animal = Dog | Cat;`.trim()
    );
}

export function testGenerateMultiLineUnion() {
    const simpleUnion = `
type Binary
    = True
    | False
    `.trim();

    const complexUnion = `
type Animal
    = Dog { name: string }
    | Cat { lives: number }
`.trim();

    const parsed = parse(simpleUnion + "\n\n" + complexUnion);

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

type Dog = {
    kind: "Dog";
    name: string;
}

function Dog(name): Dog {
    return {
        kind: "Dog",
        name
    }
}

type Cat = {
    kind: "Cat";
    lives: number;
}

function Cat(lives): Cat {
    return {
        kind: "Cat",
        lives
    }
}

type Animal = Dog | Cat;`.trim()
    );
}
