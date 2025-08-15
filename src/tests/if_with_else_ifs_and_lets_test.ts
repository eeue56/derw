import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Const,
    ElseIfStatement,
    Equality,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    IfStatement,
    Module,
    ModuleReference,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
reducer: number -> string -> boolean
reducer index line =
    if line.charAt index == "0" then
        let
            x: number
            x =
                5
        in
            true
    else if line.charAt index == "1" then
        let
            x: number
            x =
                6
        in
            true
    else if line.charAt index == "2" then
        let
            x: number
            x =
                7
        in
            true
    else
        let
            x: number
            x =
                8
        in
            false
`.trim();

const multiLine = `
reducer: number -> string -> boolean
reducer index line =
    if line.charAt index == "0" then
        let
            x: number
            x =
                5
        in
            true
    else if line.charAt index == "1" then
        let
            x: number
            x =
                6
        in
            true
    else if line.charAt index == "2" then
        let
            x: number
            x =
                7
        in
            true
    else
        let
            x: number
            x =
                8
        in
            false
`.trim();

const expectedOutput = `
function reducer(index: number, line: string): boolean {
    if (line.charAt(index) === "0") {
        const x: number = 5;
        return true;
    } else if (line.charAt(index) === "1") {
        const x: number = 6;
        return true;
    } else if (line.charAt(index) === "2") {
        const x: number = 7;
        return true;
    } else {
        const x: number = 8;
        return false;
    }
}
`.trim();

const expectedOutputJS = `
function reducer(index, line) {
    if (line.charAt(index) === "0") {
        const x = 5;
        return true;
    } else if (line.charAt(index) === "1") {
        const x = 6;
        return true;
    } else if (line.charAt(index) === "2") {
        const x = 7;
        return true;
    } else {
        const x = 8;
        return false;
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
                    "reducer",
                    FixedType("boolean", []),
                    [
                        FunctionArg("index", FixedType("number", [])),
                        FunctionArg("line", FixedType("string", [])),
                    ],
                    [],
                    IfStatement(
                        Equality(
                            ModuleReference(
                                ["line"],
                                FunctionCall("charAt", [Value("index")])
                            ),
                            StringValue("0")
                        ),
                        Value("true"),
                        [Const("x", FixedType("number", []), [], Value("5"))],
                        [
                            ElseIfStatement(
                                Equality(
                                    ModuleReference(
                                        ["line"],
                                        FunctionCall("charAt", [Value("index")])
                                    ),
                                    StringValue("1")
                                ),
                                Value("true"),
                                [
                                    Const(
                                        "x",
                                        FixedType("number", []),
                                        [],
                                        Value("6")
                                    ),
                                ]
                            ),
                            ElseIfStatement(
                                Equality(
                                    ModuleReference(
                                        ["line"],
                                        FunctionCall("charAt", [Value("index")])
                                    ),
                                    StringValue("2")
                                ),
                                Value("true"),
                                [
                                    Const(
                                        "x",
                                        FixedType("number", []),
                                        [],
                                        Value("7")
                                    ),
                                ]
                            ),
                        ],
                        Value("false"),
                        [Const("x", FixedType("number", []), [], Value("8"))]
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
                Function(
                    "reducer",
                    FixedType("boolean", []),
                    [
                        FunctionArg("index", FixedType("number", [])),
                        FunctionArg("line", FixedType("string", [])),
                    ],
                    [],
                    IfStatement(
                        Equality(
                            ModuleReference(
                                ["line"],
                                FunctionCall("charAt", [Value("index")])
                            ),
                            StringValue("0")
                        ),
                        Value("true"),
                        [Const("x", FixedType("number", []), [], Value("5"))],
                        [
                            ElseIfStatement(
                                Equality(
                                    ModuleReference(
                                        ["line"],
                                        FunctionCall("charAt", [Value("index")])
                                    ),
                                    StringValue("1")
                                ),
                                Value("true"),
                                [
                                    Const(
                                        "x",
                                        FixedType("number", []),
                                        [],
                                        Value("6")
                                    ),
                                ]
                            ),
                            ElseIfStatement(
                                Equality(
                                    ModuleReference(
                                        ["line"],
                                        FunctionCall("charAt", [Value("index")])
                                    ),
                                    StringValue("2")
                                ),
                                Value("true"),
                                [
                                    Const(
                                        "x",
                                        FixedType("number", []),
                                        [],
                                        Value("7")
                                    ),
                                ]
                            ),
                        ],
                        Value("false"),
                        [Const("x", FixedType("number", []), [], Value("8"))]
                    )
                ),
            ],
            []
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
