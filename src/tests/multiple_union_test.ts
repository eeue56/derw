import * as assert from "@eeue56/ts-assert";
import { intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateTypescript } from "../generator";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import {
    FixedType,
    Module,
    Tag,
    TagArg,
    UnionType,
    UnparsedBlock,
} from "../types";

const expectedOutput = `
type True = {
    kind: "True";
};

function True(args: {}): True {
    return {
        kind: "True",
        ...args,
    };
}

type False = {
    kind: "False";
};

function False(args: {}): False {
    return {
        kind: "False",
        ...args,
    };
}

type Binary = True | False;

type Dog = {
    kind: "Dog";
    name: string;
};

function Dog(args: { name: string }): Dog {
    return {
        kind: "Dog",
        ...args,
    };
}

type Cat = {
    kind: "Cat";
    lives: number;
};

function Cat(args: { lives: number }): Cat {
    return {
        kind: "Cat",
        ...args,
    };
}

type Animal = Dog | Cat;`.trim();

const expectedOutputJS = `
function True(args) {
    return {
        kind: "True",
        ...args,
    };
}

function False(args) {
    return {
        kind: "False",
        ...args,
    };
}

function Dog(args) {
    return {
        kind: "Dog",
        ...args,
    };
}

function Cat(args) {
    return {
        kind: "Cat",
        ...args,
    };
}
`.trim();

export function testIntoBlocks() {
    const simpleUnion = `
type Binary = True | False
`.trim();
    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
`.trim();

    assert.deepStrictEqual(intoBlocks(simpleUnion + "\n\n" + complexUnion), [
        UnparsedBlock("UnionTypeBlock", 0, simpleUnion.split("\n")),
        UnparsedBlock("UnionTypeBlock", 2, complexUnion.split("\n")),
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
        UnparsedBlock("UnionTypeBlock", 0, simpleUnion.split("\n")),
        UnparsedBlock("UnionTypeBlock", 4, complexUnion.split("\n")),
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

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}

export function testCompile() {
    const compiled = compileTypescript(expectedOutput);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}

export function testGenerateOneLineJS() {
    const simpleUnion = `
type Binary = True | False
    `.trim();

    const complexUnion = `
type Animal = Dog { name: string } | Cat { lives: number }
    `.trim();

    const parsed = parse(simpleUnion + "\n\n" + complexUnion);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateJS() {
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
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}
