import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Branch,
    CaseStatement,
    Const,
    Destructure,
    DoBlock,
    FixedType,
    Function,
    FunctionArg,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isTrue: Maybe boolean -> boolean
isTrue value =
    do
        x: boolean
        x =
            case value of
                Just { value } ->
                    value

                Nothing ->
                    false

        five: number
        five =
            5
    return
        x
`.trim();

const multiLine = `
isTrue: Maybe boolean -> boolean
isTrue value =
    do
        x: boolean
        x =
            case value of
                Just { value } ->
                    value

                Nothing ->
                    false

        five: number
        five =
            5
    return
        x
`.trim();

const expectedOutput = `
async function isTrue(value: Maybe<boolean>): Promise<boolean> {
    const x: boolean = await (function (): any {
        switch (value.kind) {
            case "Just": {
                const { value } = value;
                return value;
            }
            case "Nothing": {
                return false;
            }
        }
    })();
    const five: number = await 5;
    return x;
}
`.trim();

const expectedOutputJS = `
async function isTrue(value) {
    const x = await (function () {
        switch (value.kind) {
            case "Just": {
                const { value } = value;
                return value;
            }
            case "Nothing": {
                return false;
            }
        }
    })();
    const five = await 5;
    return x;
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
                            FixedType("Maybe", [ FixedType("boolean", [ ]) ])
                        ),
                    ],
                    [ ],
                    Value("x"),
                    DoBlock([
                        Const(
                            "x",
                            FixedType("boolean", [ ]),
                            [ ],
                            CaseStatement(Value("value"), [
                                Branch(
                                    Destructure("Just", "{ value }"),
                                    Value("value"),
                                    [ ]
                                ),
                                Branch(
                                    Destructure("Nothing", ""),
                                    Value("false"),
                                    [ ]
                                ),
                            ])
                        ),
                        Const(
                            "five",
                            FixedType("number", [ ]),
                            [ ],
                            Value("5")
                        ),
                    ])
                ),
            ],
            [
                "Error on lines 0 - 17\n" +
                    "Type Maybe (boolean) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe boolean -> boolean\n" +
                    "isTrue value =\n" +
                    "    do\n" +
                    "        x: boolean\n" +
                    "        x =\n" +
                    "            case value of\n" +
                    "                Just { value } ->\n" +
                    "                    value\n" +
                    "\n" +
                    "                Nothing ->\n" +
                    "                    false\n" +
                    "\n" +
                    "        five: number\n" +
                    "        five =\n" +
                    "            5\n" +
                    "    return\n" +
                    "        x\n" +
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
                            FixedType("Maybe", [ FixedType("boolean", [ ]) ])
                        ),
                    ],
                    [ ],
                    Value("x"),
                    DoBlock([
                        Const(
                            "x",
                            FixedType("boolean", [ ]),
                            [ ],
                            CaseStatement(Value("value"), [
                                Branch(
                                    Destructure("Just", "{ value }"),
                                    Value("value"),
                                    [ ]
                                ),
                                Branch(
                                    Destructure("Nothing", ""),
                                    Value("false"),
                                    [ ]
                                ),
                            ])
                        ),
                        Const(
                            "five",
                            FixedType("number", [ ]),
                            [ ],
                            Value("5")
                        ),
                    ])
                ),
            ],
            [
                "Error on lines 0 - 17\n" +
                    "Type Maybe (boolean) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe boolean -> boolean\n" +
                    "isTrue value =\n" +
                    "    do\n" +
                    "        x: boolean\n" +
                    "        x =\n" +
                    "            case value of\n" +
                    "                Just { value } ->\n" +
                    "                    value\n" +
                    "\n" +
                    "                Nothing ->\n" +
                    "                    false\n" +
                    "\n" +
                    "        five: number\n" +
                    "        five =\n" +
                    "            5\n" +
                    "    return\n" +
                    "        x\n" +
                    "```",
            ]
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
