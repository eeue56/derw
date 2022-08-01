import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Const,
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
        x: a
        x = 5
    in
        if value then true else false
`.trim();

const multiLine = `
isTrue: Maybe a -> boolean
isTrue value =
    let
        x: a
        x = 5
    in
        if value then true else false
`.trim();

const expectedOutput = `
function isTrue<a>(value: Maybe<a>): boolean {
    const x: a = 5;
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim();

const expectedOutputJS = `
function isTrue(value) {
    const x = 5;
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
                    [ Const("x", GenericType("a"), [ ], Value("5")) ],
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
                "Error on lines 0 - 7\n" +
                    "Type Maybe (a) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe a -> boolean\n" +
                    "isTrue value =\n" +
                    "    let\n" +
                    "        x: a\n" +
                    "        x = 5\n" +
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
                    [ Const("x", GenericType("a"), [ ], Value("5")) ],
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
                "Error on lines 0 - 7\n" +
                    "Type Maybe (a) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe a -> boolean\n" +
                    "isTrue value =\n" +
                    "    let\n" +
                    "        x: a\n" +
                    "        x = 5\n" +
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
