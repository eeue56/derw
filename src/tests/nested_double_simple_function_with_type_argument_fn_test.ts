import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    IfStatement,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isTrue: Maybe a -> boolean
isTrue value =
    let
        x: a -> boolean
        x y =
            let
                f: a -> boolean
                f n =
                    true
            in
                true
    in
        if value then true else false
`.trim();

const multiLine = `
isTrue: Maybe a -> boolean
isTrue value =
    let
        x: a -> boolean
        x y =
            let
                f: a -> boolean
                f n =
                    true
            in
                true
    in
        if value then true else false
`.trim();

const expectedOutput = `
function isTrue<a>(value: Maybe<a>): boolean {
    function x(y: a): boolean {
        function f(n: a): boolean {
            return true;
        }
        return true;
    }
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim();

const expectedOutputJS = `
function isTrue(value) {
    function x(y) {
        function f(n) {
            return true;
        }
        return true;
    }
    if (value) {
        return true;
    } else {
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
                    "isTrue",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    [
                        Function(
                            "x",
                            FixedType("boolean", [ ]),
                            [ FunctionArg("y", GenericType("a")) ],
                            [
                                Function(
                                    "f",
                                    FixedType("boolean", [ ]),
                                    [ FunctionArg("n", GenericType("a")) ],
                                    [ ],
                                    Value("true")
                                ),
                            ],
                            Value("true")
                        ),
                    ],
                    IfStatement(
                        Value("value"),
                        Value("true"),
                        [ ],
                        Value("false"),
                        [ ]
                    )
                ),
            ],
            [
                "Error on lines 0 - 13\n" +
                    "Type Maybe (a) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe a -> boolean\n" +
                    "isTrue value =\n" +
                    "    let\n" +
                    "        x: a -> boolean\n" +
                    "        x y =\n" +
                    "            let\n" +
                    "                f: a -> boolean\n" +
                    "                f n =\n" +
                    "                    true\n" +
                    "            in\n" +
                    "                true\n" +
                    "    in\n" +
                    "        if value then true else false\n" +
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
                    "isTrue",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    [
                        Function(
                            "x",
                            FixedType("boolean", [ ]),
                            [ FunctionArg("y", GenericType("a")) ],
                            [
                                Function(
                                    "f",
                                    FixedType("boolean", [ ]),
                                    [ FunctionArg("n", GenericType("a")) ],
                                    [ ],
                                    Value("true")
                                ),
                            ],
                            Value("true")
                        ),
                    ],
                    IfStatement(
                        Value("value"),
                        Value("true"),
                        [ ],
                        Value("false"),
                        [ ]
                    )
                ),
            ],
            [
                "Error on lines 0 - 13\n" +
                    "Type Maybe (a) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe a -> boolean\n" +
                    "isTrue value =\n" +
                    "    let\n" +
                    "        x: a -> boolean\n" +
                    "        x y =\n" +
                    "            let\n" +
                    "                f: a -> boolean\n" +
                    "                f n =\n" +
                    "                    true\n" +
                    "            in\n" +
                    "                true\n" +
                    "    in\n" +
                    "        if value then true else false\n" +
                    "```",
            ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
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
