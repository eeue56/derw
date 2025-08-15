import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    BlockKinds,
    Equality,
    FixedType,
    Function,
    FunctionArg,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
testIsValid: Animal -> boolean
testIsValid animal =
    animal == animal
`.trim();

const multiLine = `
testIsValid: Animal -> boolean
testIsValid animal =
    animal == animal
`.trim();

const expectedOutput = `
export { testIsValid };

function testIsValid(animal: Animal): boolean {
    return animal === animal;
}
`.trim();

const expectedOutputJS = `
export { testIsValid };

function testIsValid(animal) {
    return animal === animal;
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine),
        Ok<string, BlockKinds>("Function")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("Function")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine).body,
        Module(
            "",
            [
                Function(
                    "testIsValid",
                    FixedType("boolean", []),
                    [FunctionArg("animal", FixedType("Animal", []))],
                    [],
                    Equality(Value("animal"), Value("animal"))
                ),
            ],
            []
        ).body
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine).body,
        Module(
            "",
            [
                Function(
                    "testIsValid",
                    FixedType("boolean", []),
                    [FunctionArg("animal", FixedType("Animal", []))],
                    [],
                    Equality(Value("animal"), Value("animal"))
                ),
            ],
            []
        ).body
    );
}

export function testGenerate() {
    const parsed = parse(multiLine, "Examples_test.derw");
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateOneLine() {
    const parsed = parse(oneLine, "Examples_test.derw");
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testCompile() {
    const parsed = parse(oneLine, "Examples_test.derw");
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "Ok",
        (compiled.kind === "Err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine, "Examples_test.derw");
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "Ok",
        (compiled.kind === "Err" && compiled.error.toString()) || ""
    );
}

export function testGenerateJS() {
    const parsed = parse(multiLine, "Examples_test.derw");
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateOneLineJS() {
    const parsed = parse(oneLine, "Examples_test.derw");
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateDerw() {
    const parsed = parse(multiLine, "Examples_test.derw");
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
