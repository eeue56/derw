import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
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
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
sum: List number -> number
sum xs =
    case xs of
        [] -> 0
        y :: [] -> y
        z :: zs -> z + sum zs
        default -> 0
`.trim();

const multiLine = `
sum: List number -> number
sum xs =
    case xs of
        [] ->
            0
        y :: [] ->
            y
        z :: zs ->
            z + sum zs
        default ->
            0
`.trim();

const expectedOutput = `
function sum(xs: number[]): number {
    const _res3835 = xs;
    switch (_res3835.length) {
        case 0: {
            return 0;
        }
        case _res3835.length: {
            if (_res3835.length === 1) {
                const [ y ] = _res3835;
                return y;
            }
        }
        case _res3835.length: {
            if (_res3835.length >= 1) {
                const [ z, ...zs ] = _res3835;
                return z + sum(zs);
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
    const _res3835 = xs;
    switch (_res3835.length) {
        case 0: {
            return 0;
        }
        case _res3835.length: {
            if (_res3835.length === 1) {
                const [ y ] = _res3835;
                return y;
            }
        }
        case _res3835.length: {
            if (_res3835.length >= 1) {
                const [ z, ...zs ] = _res3835;
                return z + sum(zs);
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
        [ Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
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
                    FixedType("number", [ ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [ FixedType("number", [ ]) ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("xs"), [
                        Branch(EmptyList(), Value("0"), [ ]),
                        Branch(
                            ListDestructure([ Value("y"), EmptyList() ]),
                            Value("y"),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([ Value("z"), Value("zs") ]),
                            Addition(
                                Value("z"),
                                FunctionCall("sum", [ Value("zs") ])
                            ),
                            [ ]
                        ),
                        Branch(Default(), Value("0"), [ ]),
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
                Function(
                    "sum",
                    FixedType("number", [ ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [ FixedType("number", [ ]) ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("xs"), [
                        Branch(EmptyList(), Value("0"), [ ]),
                        Branch(
                            ListDestructure([ Value("y"), EmptyList() ]),
                            Value("y"),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([ Value("z"), Value("zs") ]),
                            Addition(
                                Value("z"),
                                FunctionCall("sum", [ Value("zs") ])
                            ),
                            [ ]
                        ),
                        Branch(Default(), Value("0"), [ ]),
                    ])
                ),
            ],
            [ ]
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
