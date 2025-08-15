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
    Const,
    FixedType,
    FunctionCall,
    ListValue,
    Module,
    ModuleReference,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
sum: number
sum = Math.sum [1, 2, 3]
`.trim();

const multiLine = `
sum: number
sum =
    Math.sum [
        1,
        2,
        3
    ]
`.trim();

const expectedOutput = `
const sum: number = Math.sum([1, 2, 3]);
`.trim();

const expectedOutputJS = `
const sum = Math.sum([1, 2, 3]);
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
    assert.deepStrictEqual(blockKind(oneLine), Ok<string, BlockKinds>("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("Const")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "sum",
                    FixedType("number", []),
                    [],
                    ModuleReference(
                        ["Math"],
                        FunctionCall("sum", [
                            ListValue([Value("1"), Value("2"), Value("3")]),
                        ])
                    )
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
                Const(
                    "sum",
                    FixedType("number", []),
                    [],
                    ModuleReference(
                        ["Math"],
                        FunctionCall("sum", [
                            ListValue([Value("1"), Value("2"), Value("3")]),
                        ])
                    )
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
