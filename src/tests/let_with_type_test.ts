import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Addition,
    BlockKinds,
    Const,
    FixedType,
    Function,
    FunctionArg,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isIncrease : number -> number
isIncrease x =
    let
        typeOfSomething: number
        typeOfSomething = x + x
    in
        typeOfSomething
`.trim();

const multiLine = `
isIncrease: number -> number
isIncrease x =
    let
        typeOfSomething: number
        typeOfSomething =
            x + x
    in
        typeOfSomething
`.trim();

const expectedOutput = `
function isIncrease(x: number): number {
    const typeOfSomething: number = x + x;
    return typeOfSomething;
}
`.trim();

const expectedOutputJS = `
function isIncrease(x) {
    const typeOfSomething = x + x;
    return typeOfSomething;
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
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "isIncrease",
                    FixedType("number", []),
                    [FunctionArg("x", FixedType("number", []))],
                    [
                        Const(
                            "typeOfSomething",
                            FixedType("number", []),
                            [],
                            Addition(Value("x"), Value("x"))
                        ),
                    ],
                    Value("typeOfSomething")
                ),
            ],
            []
        )
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Function(
                    "isIncrease",
                    FixedType("number", []),
                    [FunctionArg("x", FixedType("number", []))],
                    [
                        Const(
                            "typeOfSomething",
                            FixedType("number", []),
                            [],
                            Addition(Value("x"), Value("x"))
                        ),
                    ],
                    Value("typeOfSomething")
                ),
            ],
            []
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateOneLineJS() {
    const parsed = parse(oneLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
