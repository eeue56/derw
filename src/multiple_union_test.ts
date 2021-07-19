import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import { FixedType, Module, Tag, TagArg, Type, UnionType } from "./types";
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

export function testIntoBlocksMultiLine() {
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

export function testParse() {
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
                UnionType(FixedType("Binary", [ ]), [
                    Tag("True", [ ]),
                    Tag("False", [ ]),
                ]),
                UnionType(FixedType("Animal", [ ]), [
                    Tag("Dog", [ TagArg("name", FixedType("string", [ ])) ]),
                    Tag("Cat", [ TagArg("lives", FixedType("number", [ ])) ]),
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
                UnionType(FixedType("Binary", [ ]), [
                    Tag("True", [ ]),
                    Tag("False", [ ]),
                ]),
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

type Animal = Dog | Cat;`.trim()
    );
}
