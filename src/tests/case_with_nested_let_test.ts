import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Addition,
    Branch,
    CaseStatement,
    Const,
    FixedType,
    Function,
    FunctionArg,
    Module,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
sayHello: string -> string
sayHello name =
    case name of
        "Noah" ->
            case y of
                "0" ->
                    let
                        first: number
                        first = 1 + 2
                    in
                        "Hi 0"
                "1" ->
                    let
                        second: number
                        second = 1 + 2
                    in
                        "Hi 1"
`.trim();

const multiLine = `
sayHello: string -> string
sayHello name =
    case name of
        "Noah" ->
            case y of
                "0" ->
                    let
                        first: number
                        first = 1 + 2
                    in
                        "Hi 0"
                "1" ->
                    let
                        second: number
                        second = 1 + 2
                    in
                        "Hi 1"
`.trim();

const expectedOutput = `
function sayHello(name: string): string {
    const _res3373707 = name;
    switch (_res3373707) {
        case "Noah": {
            const _res121 = y;
            switch (_res121) {
                case "0": {
                    const first: number = 1 + 2;
                    return "Hi 0";
                }
                case "1": {
                    const second: number = 1 + 2;
                    return "Hi 1";
                }
            };
        }
    }
}
`.trim();

const expectedOutputJS = `
function sayHello(name) {
    const _res3373707 = name;
    switch (_res3373707) {
        case "Noah": {
            const _res121 = y;
            switch (_res121) {
                case "0": {
                    const first = 1 + 2;
                    return "Hi 0";
                }
                case "1": {
                    const second = 1 + 2;
                    return "Hi 1";
                }
            };
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
                    "sayHello",
                    FixedType("string", [ ]),
                    [ FunctionArg("name", FixedType("string", [ ])) ],
                    [ ],
                    CaseStatement(Value("name"), [
                        Branch(
                            StringValue("Noah"),
                            CaseStatement(Value("y"), [
                                Branch(StringValue("0"), StringValue("Hi 0"), [
                                    Const(
                                        "first",
                                        FixedType("number", [ ]),
                                        [ ],
                                        Addition(Value("1"), Value("2"))
                                    ),
                                ]),
                                Branch(StringValue("1"), StringValue("Hi 1"), [
                                    Const(
                                        "second",
                                        FixedType("number", [ ]),
                                        [ ],
                                        Addition(Value("1"), Value("2"))
                                    ),
                                ]),
                            ]),
                            [ ]
                        ),
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
                    "sayHello",
                    FixedType("string", [ ]),
                    [ FunctionArg("name", FixedType("string", [ ])) ],
                    [ ],
                    CaseStatement(Value("name"), [
                        Branch(
                            StringValue("Noah"),
                            CaseStatement(Value("y"), [
                                Branch(StringValue("0"), StringValue("Hi 0"), [
                                    Const(
                                        "first",
                                        FixedType("number", [ ]),
                                        [ ],
                                        Addition(Value("1"), Value("2"))
                                    ),
                                ]),
                                Branch(StringValue("1"), StringValue("Hi 1"), [
                                    Const(
                                        "second",
                                        FixedType("number", [ ]),
                                        [ ],
                                        Addition(Value("1"), Value("2"))
                                    ),
                                ]),
                            ]),
                            [ ]
                        ),
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
