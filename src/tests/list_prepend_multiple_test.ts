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
    ListPrepend,
    ListRange,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
helloWorld: List number
helloWorld = 0 :: 1 :: [ 2..5 ]
`.trim();

const multiLine = `
helloWorld: List number
helloWorld =
    0 :: 1 :: [ 2..5 ]
`.trim();

const expectedOutput = `
const helloWorld: number[] = [ 0, ...[ 1, ...Array.from({ length: 5 - 2 + 1 }, (x, i) => i + 2) ] ];
`.trim();

const expectedOutputJS = `
const helloWorld = [ 0, ...[ 1, ...Array.from({ length: 5 - 2 + 1 }, (x, i) => i + 2) ] ];
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
                    ListPrepend(
                        Value("0"),
                        ListPrepend(
                            Value("1"),
                            ListRange(Value("2"), Value("5"))
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
                    ListPrepend(
                        Value("0"),
                        ListPrepend(
                            Value("1"),
                            ListRange(Value("2"), Value("5"))
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
