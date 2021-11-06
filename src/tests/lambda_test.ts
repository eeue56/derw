import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    Addition,
    AnonFunctionArg,
    Const,
    FixedType,
    FormatStringValue,
    Function,
    FunctionArg,
    IfStatement,
    Lambda,
    Module,
    StringValue,
    Tag,
    Type,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

import { intoBlocks, blockKind } from "../blocks";
import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";

const oneLine = `
add: number -> number -> number
add = \\x y -> x + y
`.trim();

const multiLine = `
add: number -> number -> number
add =
    \\x y -> x + y
`.trim();

const expectedOutput = `
function add(_0: number, _1: number): number {
    return function(x: any, y: any) {
        return x + y;
    };
}
`.trim();

const expectedOutputJS = `
function add(_0, _1) {
    return function(x, y) {
        return x + y;
    };
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
                    "add",
                    FixedType("number", [ ]),
                    [
                        AnonFunctionArg(0, FixedType("number", [ ])),
                        AnonFunctionArg(1, FixedType("number", [ ])),
                    ],
                    Lambda([ "x", "y" ], Addition(Value("x"), Value("y")))
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
                    "add",
                    FixedType("number", [ ]),
                    [
                        AnonFunctionArg(0, FixedType("number", [ ])),
                        AnonFunctionArg(1, FixedType("number", [ ])),
                    ],
                    Lambda([ "x", "y" ], Addition(Value("x"), Value("y")))
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
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
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
