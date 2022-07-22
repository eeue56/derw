import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/derw";
import { generateElm } from "../generators/elm";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    FunctionType,
    GenericType,
    Module,
    ModuleReference,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
map: (a -> b) -> List a -> List b
map fn value = value.map fn
`.trim();

const multiLine = `
map: (a -> b) -> List a -> List b
map fn value =
    value.map fn
`.trim();

const expectedOutput = `
function map<a, b>(fn: (arg0: a) => b, value: a[]): b[] {
    return value.map(fn);
}
`.trim();

const expectedOutputJS = `
function map(fn, value) {
    return value.map(fn);
}
`.trim();

const expectedOutputDerw = `
map: (a -> b) -> List a -> List b
map fn value =
    value.map fn
`.trim();

const expectedOutputElm = `
module Main exposing (..)

map: (a -> b) -> List a -> List b
map fn value =
    value.map fn
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
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "map",
                    FixedType("List", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([ GenericType("a"), GenericType("b") ])
                        ),
                        FunctionArg(
                            "value",
                            FixedType("List", [ GenericType("a") ])
                        ),
                    ],
                    [ ],
                    ModuleReference(
                        [ "value" ],
                        FunctionCall("map", [ Value("fn") ])
                    )
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
                Function(
                    "map",
                    FixedType("List", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([ GenericType("a"), GenericType("b") ])
                        ),
                        FunctionArg(
                            "value",
                            FixedType("List", [ GenericType("a") ])
                        ),
                    ],
                    [ ],
                    ModuleReference(
                        [ "value" ],
                        FunctionCall("map", [ Value("fn") ])
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
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
    assert.strictEqual(generated, expectedOutputDerw);
}

export function testGenerateOneLineElm() {
    const parsed = parse(oneLine);
    const generated = generateElm(parsed);
    assert.strictEqual(generated, expectedOutputElm);
}
