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
    FunctionCall,
    FunctionType,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
map: (Maybe Row -> boolean) -> Maybe Row -> boolean
map fn value = fn value
`.trim();

const multiLine = `
map: (Maybe Row -> boolean) -> Maybe Row -> boolean
map fn value =
    fn value
`.trim();

const expectedOutput = `
function map(fn: (arg0: Maybe<Row>) => boolean, value: Maybe<Row>): boolean {
    return fn(value);
}
`.trim();

const expectedOutputJS = `
function map(fn, value) {
    return fn(value);
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
                    "map",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([
                                FixedType("Maybe", [ FixedType("Row", [ ]) ]),
                                FixedType("boolean", [ ]),
                            ])
                        ),
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ FixedType("Row", [ ]) ])
                        ),
                    ],
                    [ ],
                    FunctionCall("fn", [ Value("value") ])
                ),
            ],
            [
                "Error on lines 0 - 2\n" +
                    "Type Maybe (Row) did not exist in the namespace:\n" +
                    "```\n" +
                    "map: (Maybe Row -> boolean) -> Maybe Row -> boolean\n" +
                    "map fn value = fn value\n" +
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
                    "map",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([
                                FixedType("Maybe", [ FixedType("Row", [ ]) ]),
                                FixedType("boolean", [ ]),
                            ])
                        ),
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ FixedType("Row", [ ]) ])
                        ),
                    ],
                    [ ],
                    FunctionCall("fn", [ Value("value") ])
                ),
            ],
            [
                "Error on lines 0 - 3\n" +
                    "Type Maybe (Row) did not exist in the namespace:\n" +
                    "```\n" +
                    "map: (Maybe Row -> boolean) -> Maybe Row -> boolean\n" +
                    "map fn value =\n" +
                    "    fn value\n" +
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
