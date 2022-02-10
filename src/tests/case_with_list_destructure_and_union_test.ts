import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import { generateTypescript } from "../ts_generator";
import {
    Branch,
    CaseStatement,
    Constructor,
    Default,
    EmptyList,
    Field,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    ListDestructure,
    ListPrepend,
    ListValue,
    Module,
    ObjectLiteral,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
basic: List string -> List (Maybe string)
basic xs =
    case xs of
        anything :: [] -> Just { value: "hello" } :: basic [ ]

        default -> []
`.trim();

const multiLine = `
basic: List string -> List (Maybe string)
basic xs =
    case xs of
        anything :: [] ->
            Just { value: "hello" } :: basic [ ]

        default ->
            []
`.trim();

const expectedOutput = `
function basic(xs: string[]): Maybe<string>[] {
    const _res3835 = xs;
    switch (_res3835.length) {
        case _res3835.length: {
            if (_res3835.length === 1) {
                const [ anything ] = _res3835;
                return [ Just({ value: "hello" }), ...basic([ ]) ];
            }
        }
        default: {
            return [ ];
        }
    }
}
`.trim();

const expectedOutputJS = `
function basic(xs) {
    const _res3835 = xs;
    switch (_res3835.length) {
        case _res3835.length: {
            if (_res3835.length === 1) {
                const [ anything ] = _res3835;
                return [ Just({ value: "hello" }), ...basic([ ]) ];
            }
        }
        default: {
            return [ ];
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
    console.log(JSON.stringify(parse(oneLine), null, 4));
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "basic",
                    FixedType("List", [
                        FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [ FixedType("string", [ ]) ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("xs"), [
                        Branch(
                            ListDestructure([ Value("anything"), EmptyList() ]),
                            ListPrepend(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", StringValue("hello")),
                                    ])
                                ),
                                FunctionCall("basic", [ ListValue([ ]) ])
                            ),
                            [ ]
                        ),
                        Branch(Default(), ListValue([ ]), [ ]),
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
                    "basic",
                    FixedType("List", [
                        FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [ FixedType("string", [ ]) ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("xs"), [
                        Branch(
                            ListDestructure([ Value("anything"), EmptyList() ]),
                            ListPrepend(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", StringValue("hello")),
                                    ])
                                ),
                                FunctionCall("basic", [ ListValue([ ]) ])
                            ),
                            [ ]
                        ),
                        Branch(Default(), ListValue([ ]), [ ]),
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
