import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import { BlockKinds, Export, UnparsedBlock } from "../types";

const oneLine = `
exposing (isValid, Animal)

type Animal = Cat { name: string } | Dog { name: string }

isValid: Animal -> boolean
isValid animal =
    animal == animal
`.trim();

const multiLine = `
exposing (isValid)
exposing (Animal)

type Animal =
    Cat { name: string }
    | Dog { name: string }

isValid: Animal -> boolean
isValid animal =
    animal == animal
`.trim();

const expectedOutput = `
export { isValid };
export { Animal };

type Cat = {
    kind: "Cat";
    name: string;
};

function Cat(args: { name: string }): Cat {
    return {
        kind: "Cat",
        ...args,
    };
}

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

type Animal = Cat | Dog;

function isValid(animal: Animal): boolean {
    return animal === animal;
}
`.trim();

const expectedOutputMultiLine = `
export { isValid };

export { Animal };

type Cat = {
    kind: "Cat";
    name: string;
};

function Cat(args: { name: string }): Cat {
    return {
        kind: "Cat",
        ...args,
    };
}

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

type Animal = Cat | Dog;

function isValid(animal: Animal): boolean {
    return animal === animal;
}
`.trim();

const expectedOutputJS = `
export { isValid };

function Cat(args) {
    return {
        kind: "Cat",
        ...args,
    };
}

function Dog(args) {
    return {
        kind: "Dog",
        ...args,
    };
}

function isValid(animal) {
    return animal === animal;
}
`.trim();

const expectedOutputJSMultiLine = `
export { isValid };

function Cat(args) {
    return {
        kind: "Cat",
        ...args,
    };
}

function Dog(args) {
    return {
        kind: "Dog",
        ...args,
    };
}

function isValid(animal) {
    return animal === animal;
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(
        [ intoBlocks(oneLine)[0] ],
        [ UnparsedBlock("ExportBlock", 0, [ oneLine.split("\n")[0] ]) ]
    );
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine).slice(0, 2), [
        UnparsedBlock("ExportBlock", 0, [ multiLine.split("\n")[0] ]),
        UnparsedBlock("ExportBlock", 1, [ multiLine.split("\n")[1] ]),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine.split("\n").slice(0, 1).join("\n")),
        Ok<string, BlockKinds>("Export")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine.split("\n").slice(0, 2).join("\n")),
        Ok<string, BlockKinds>("Export")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine).body[0],
        Export([ "isValid", "Animal" ])
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(parse(multiLine).body.slice(0, 2), [
        Export([ "isValid" ]),
        Export([ "Animal" ]),
    ]);
}

export function testGenerate() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutputMultiLine);
}

export function testGenerateOneLine() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testCompile() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "Ok",
        (compiled.kind === "Err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "Ok",
        (compiled.kind === "Err" && compiled.error.toString()) || ""
    );
}

export function testGenerateJS() {
    const parsed = parse(multiLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJSMultiLine);
}

export function testGenerateOneLineJS() {
    const parsed = parse(oneLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}
