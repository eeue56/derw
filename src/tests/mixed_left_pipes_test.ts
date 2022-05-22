import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Const,
    FixedType,
    FunctionCall,
    LeftPipe,
    ListValue,
    Module,
    ModuleReference,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
helloWorld: List number
helloWorld = [ 1, 2, 3] |> List.foldl add |> add 10 |> mult 4 |> sum
`.trim();

const multiLine = `
helloWorld: List number
helloWorld =
    [ 1, 2, 3]
        |> List.foldl add
        |> add 10
        |> mult 4
        |> sum
`.trim();

const expectedOutput = `
const helloWorld: number[] = sum(mult(4, add(10, List.foldl(add, [ 1, 2, 3 ]))));
`.trim();

const expectedOutputJS = `
const helloWorld = sum(mult(4, add(10, List.foldl(add, [ 1, 2, 3 ]))));
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
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    [ ],
                    LeftPipe(
                        ListValue([ Value("1"), Value("2"), Value("3") ]),
                        LeftPipe(
                            ModuleReference(
                                [ "List" ],
                                FunctionCall("foldl", [ Value("add") ])
                            ),
                            LeftPipe(
                                FunctionCall("add", [ Value("10") ]),
                                LeftPipe(
                                    FunctionCall("mult", [ Value("4") ]),
                                    Value("sum")
                                )
                            )
                        )
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
                Const(
                    "helloWorld",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    [ ],
                    LeftPipe(
                        ListValue([ Value("1"), Value("2"), Value("3") ]),
                        LeftPipe(
                            ModuleReference(
                                [ "List" ],
                                FunctionCall("foldl", [ Value("add") ])
                            ),
                            LeftPipe(
                                FunctionCall("add", [ Value("10") ]),
                                LeftPipe(
                                    FunctionCall("mult", [ Value("4") ]),
                                    Value("sum")
                                )
                            )
                        )
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
