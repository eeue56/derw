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
    Branch,
    CaseStatement,
    Default,
    EmptyList,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    ListDestructure,
    Module,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
sum: List string -> number
sum xs =
    case xs of
        [] -> 0
        "1" :: [] -> 1 + 2
        "2" :: zs -> 2 + sum zs
        default -> 0
`.trim();

const multiLine = `
sum: List string -> number
sum xs =
    case xs of
        [] ->
            0

        "1" :: [] ->
            1 + 2

        "2" :: zs ->
            2 + (sum zs)

        default ->
            0
`.trim();

const expectedOutput = `
function sum(xs: string[]): number {
    switch (xs.length) {
        case 0: {
            return 0;
        }
        case xs.length: {
            if (xs.length === 1) {
                const [ _temp ] = xs;
                if (_temp === "1") {
                    return 1 + 2;
                }
            }
        }
        case xs.length: {
            if (xs.length >= 1) {
                const [ _temp, ...zs ] = xs;
                if (_temp === "2") {
                    return 2 + sum(zs);
                }
            }
        }
        default: {
            return 0;
        }
    }
}
`.trim();

const expectedOutputJS = `
function sum(xs) {
    switch (xs.length) {
        case 0: {
            return 0;
        }
        case xs.length: {
            if (xs.length === 1) {
                const [ _temp ] = xs;
                if (_temp === "1") {
                    return 1 + 2;
                }
            }
        }
        case xs.length: {
            if (xs.length >= 1) {
                const [ _temp, ...zs ] = xs;
                if (_temp === "2") {
                    return 2 + sum(zs);
                }
            }
        }
        default: {
            return 0;
        }
    }
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
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [Ok("Function")]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [Ok("Function")]
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "sum",
                    FixedType("number", []),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [FixedType("string", [])])
                        ),
                    ],
                    [],
                    CaseStatement(Value("xs"), [
                        Branch(EmptyList(), Value("0"), []),
                        Branch(
                            ListDestructure([StringValue("1"), EmptyList()]),
                            Addition(Value("1"), Value("2")),
                            []
                        ),
                        Branch(
                            ListDestructure([StringValue("2"), Value("zs")]),
                            Addition(
                                Value("2"),
                                FunctionCall("sum", [Value("zs")])
                            ),
                            []
                        ),
                        Branch(Default(), Value("0"), []),
                    ])
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
                    "sum",
                    FixedType("number", []),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [FixedType("string", [])])
                        ),
                    ],
                    [],
                    CaseStatement(Value("xs"), [
                        Branch(EmptyList(), Value("0"), []),
                        Branch(
                            ListDestructure([StringValue("1"), EmptyList()]),
                            Addition(Value("1"), Value("2")),
                            []
                        ),
                        Branch(
                            ListDestructure([StringValue("2"), Value("zs")]),
                            Addition(
                                Value("2"),
                                FunctionCall("sum", [Value("zs")])
                            ),
                            []
                        ),
                        Branch(Default(), Value("0"), []),
                    ])
                ),
            ],
            []
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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
