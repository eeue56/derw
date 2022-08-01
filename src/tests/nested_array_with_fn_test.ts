import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Const,
    FixedType,
    FunctionCall,
    GenericType,
    ListValue,
    Module,
    UnparsedBlock,
} from "../types";

const oneLine = `
helloWorld: List (List any)
helloWorld = div [ ] [ ] [ div [ ] [ ] [ ] ]
`.trim();

const multiLine = `
helloWorld: List (List any)
helloWorld =
    div [ ] [ ] [ div [ ] [ ] [ ]]
`.trim();

const expectedOutput = `
const helloWorld: any[][] = div([ ], [ ], [ div([ ], [ ], [ ]) ]);
`.trim();

const expectedOutputJS = `
const helloWorld = div([ ], [ ], [ div([ ], [ ], [ ]) ]);
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Const"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "helloWorld",
                    FixedType("List", [
                        FixedType("List", [ GenericType("any") ]),
                    ]),
                    [ ],
                    FunctionCall("div", [
                        ListValue([ ]),
                        ListValue([ ]),
                        ListValue([
                            FunctionCall("div", [
                                ListValue([ ]),
                                ListValue([ ]),
                                ListValue([ ]),
                            ]),
                        ]),
                    ])
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
                Const(
                    "helloWorld",
                    FixedType("List", [
                        FixedType("List", [ GenericType("any") ]),
                    ]),
                    [ ],
                    FunctionCall("div", [
                        ListValue([ ]),
                        ListValue([ ]),
                        ListValue([
                            FunctionCall("div", [
                                ListValue([ ]),
                                ListValue([ ]),
                                ListValue([ ]),
                            ]),
                        ]),
                    ])
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
