import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    ListRange,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
range: number -> number -> List number
range start end = [ start..end ]
`.trim();

const multiLine = `
range: number -> number -> List number
range start end =
    [ start..end ]
`.trim();

const expectedOutput = `
function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (x, i) => i + start);
}
`.trim();

const expectedOutputJS = `
function range(start, end) {
    return Array.from({ length: end - start + 1 }, (x, i) => i + start);
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
                    "range",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    [
                        FunctionArg("start", FixedType("number", [ ])),
                        FunctionArg("end", FixedType("number", [ ])),
                    ],
                    [ ],
                    ListRange(Value("start"), Value("end"))
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
                    "range",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    [
                        FunctionArg("start", FixedType("number", [ ])),
                        FunctionArg("end", FixedType("number", [ ])),
                    ],
                    [ ],
                    ListRange(Value("start"), Value("end"))
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
