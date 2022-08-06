import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Const,
    DoBlock,
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
isTrue: Maybe boolean -> boolean
isTrue value =
    do
        if value then
            console.log "true"
        else
            console.log "false"

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
        if value then
            console.log "true"
        else
            console.log "false"

        five: number
        five =
            5
    return
        x
`.trim();

const expectedOutput = `
async function isTrue(value: Maybe<boolean>): Promise<boolean> {
    if (value) {
        await console.log("true");
    } else {
        await console.log("false");
    }
    const five: number = await 5;
    return x;
}
`.trim();

const expectedOutputJS = `
async function isTrue(value) {
    if (value) {
        await console.log("true");
    } else {
        await console.log("false");
    }
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
                        IfStatement(
                            Value("value"),
                            ModuleReference(
                                [ "console" ],
                                FunctionCall("log", [ StringValue("true") ])
                            ),
                            [ ],
                            ModuleReference(
                                [ "console" ],
                                FunctionCall("log", [ StringValue("false") ])
                            ),
                            [ ]
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
                "Error on lines 0 - 13\n" +
                    "Type Maybe (boolean) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe boolean -> boolean\n" +
                    "isTrue value =\n" +
                    "    do\n" +
                    "        if value then\n" +
                    '            console.log "true"\n' +
                    "        else\n" +
                    '            console.log "false"\n' +
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
                        IfStatement(
                            Value("value"),
                            ModuleReference(
                                [ "console" ],
                                FunctionCall("log", [ StringValue("true") ])
                            ),
                            [ ],
                            ModuleReference(
                                [ "console" ],
                                FunctionCall("log", [ StringValue("false") ])
                            ),
                            [ ]
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
                "Error on lines 0 - 13\n" +
                    "Type Maybe (boolean) did not exist in the namespace:\n" +
                    "```\n" +
                    "isTrue: Maybe boolean -> boolean\n" +
                    "isTrue value =\n" +
                    "    do\n" +
                    "        if value then\n" +
                    '            console.log "true"\n' +
                    "        else\n" +
                    '            console.log "false"\n' +
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

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
