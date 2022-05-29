import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Equality,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    GenericType,
    IfStatement,
    Module,
    ModuleReference,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
reducer: a -> string -> boolean
reducer index line =
    if line.charAt index == "0" then
        let
            x: a -> string
            x y = "hello"
        in
            true
    else
        let
            y: string -> a
            y x = "world"
        in
            false
`.trim();

const multiLine = `
reducer: a -> string -> boolean
reducer index line =
    if line.charAt index == "0" then
        let
            x: a -> string
            x y = "hello"
        in
            true
    else
        let
            y: string -> a
            y x = "world"
        in
            false
`.trim();

const expectedOutput = `
function reducer<a>(index: a, line: string): boolean {
    if (line.charAt(index) === "0") {
        function x(y: a): string {
            return "hello";
        }
        return true;
    } else {
        function y(x: string): a {
            return "world";
        }
        return false;
    }
}
`.trim();

const expectedOutputJS = `
function reducer(index, line) {
    if (line.charAt(index) === "0") {
        function x(y) {
            return "hello";
        }
        return true;
    } else {
        function y(x) {
            return "world";
        }
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
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("index", GenericType("a")),
                        FunctionArg("line", FixedType("string", [ ])),
                    ],
                    [ ],
                    IfStatement(
                        Equality(
                            ModuleReference(
                                [ "line" ],
                                FunctionCall("charAt", [ Value("index") ])
                            ),
                            StringValue("0")
                        ),
                        Value("true"),
                        [
                            Function(
                                "x",
                                FixedType("string", [ ]),
                                [ FunctionArg("y", GenericType("a")) ],
                                [ ],
                                StringValue("hello")
                            ),
                        ],
                        Value("false"),
                        [
                            Function(
                                "y",
                                GenericType("a"),
                                [ FunctionArg("x", FixedType("string", [ ])) ],
                                [ ],
                                StringValue("world")
                            ),
                        ]
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
                Function(
                    "reducer",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("index", GenericType("a")),
                        FunctionArg("line", FixedType("string", [ ])),
                    ],
                    [ ],
                    IfStatement(
                        Equality(
                            ModuleReference(
                                [ "line" ],
                                FunctionCall("charAt", [ Value("index") ])
                            ),
                            StringValue("0")
                        ),
                        Value("true"),
                        [
                            Function(
                                "x",
                                FixedType("string", [ ]),
                                [ FunctionArg("y", GenericType("a")) ],
                                [ ],
                                StringValue("hello")
                            ),
                        ],
                        Value("false"),
                        [
                            Function(
                                "y",
                                GenericType("a"),
                                [ FunctionArg("x", FixedType("string", [ ])) ],
                                [ ],
                                StringValue("world")
                            ),
                        ]
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
