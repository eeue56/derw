import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isTrue: Result string (List string) -> Result string (List string)
isTrue value = value
`.trim();

const multiLine = `
isTrue: Result string (List string) -> Result string (List string)
isTrue value =
    value
`.trim();

const expectedOutput = `
function isTrue(value: Result<string, string[]>): Result<string, string[]> {
    return value;
}
`.trim();

const expectedOutputJS = `
function isTrue(value) {
    return value;
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
                    "isTrue",
                    FixedType("Result", [
                        FixedType("string", [ ]),
                        FixedType("List", [ FixedType("string", [ ]) ]),
                    ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Result", [
                                FixedType("string", [ ]),
                                FixedType("List", [ FixedType("string", [ ]) ]),
                            ])
                        ),
                    ],
                    [ ],
                    Value("value")
                ),
            ],
            [
                "Error on lines 0 - 2\n" +
                    "Type Result (string List (string)) did not exist in the namespace\n" +
                    "Type Result (string List (string)) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Result string (List string) -> Result string (List string)\n" +
                    "isTrue value = value\n" +
                    "```",
            ]
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
                    "isTrue",
                    FixedType("Result", [
                        FixedType("string", [ ]),
                        FixedType("List", [ FixedType("string", [ ]) ]),
                    ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Result", [
                                FixedType("string", [ ]),
                                FixedType("List", [ FixedType("string", [ ]) ]),
                            ])
                        ),
                    ],
                    [ ],
                    Value("value")
                ),
            ],
            [
                "Error on lines 0 - 3\n" +
                    "Type Result (string List (string)) did not exist in the namespace\n" +
                    "Type Result (string List (string)) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Result string (List string) -> Result string (List string)\n" +
                    "isTrue value =\n" +
                    "    value\n" +
                    "```",
            ]
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
    assert.strictEqual(generated, multiLine);
}
