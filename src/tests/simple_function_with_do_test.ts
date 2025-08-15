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
isTrue: boolean -> boolean
isTrue value =
    do
        globalThis.console.log "hello"

        x: number
        x =
            5

        globalThis.console.log x
    return
        if value then
            true
        else
            false
`.trim();

const multiLine = `
isTrue: boolean -> boolean
isTrue value =
    do
        globalThis.console.log "hello"

        x: number
        x =
            5

        globalThis.console.log x
    return
        if value then
            true
        else
            false
`.trim();

const expectedOutput = `
async function isTrue(value: boolean): Promise<boolean> {
    await globalThis.console.log("hello");
    const x: number = await 5;
    await globalThis.console.log(x);
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim();

const expectedOutputJS = `
async function isTrue(value) {
    await globalThis.console.log("hello");
    const x = await 5;
    await globalThis.console.log(x);
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
                    FixedType("boolean", []),
                    [FunctionArg("value", FixedType("boolean", []))],
                    [],
                    IfStatement(
                        Value("value"),
                        Value("true"),
                        [],
                        [],
                        Value("false"),
                        []
                    ),
                    DoBlock([
                        ModuleReference(
                            ["globalThis", "console"],
                            FunctionCall("log", [StringValue("hello")])
                        ),
                        Const("x", FixedType("number", []), [], Value("5")),
                        ModuleReference(
                            ["globalThis", "console"],
                            FunctionCall("log", [Value("x")])
                        ),
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
                    "isTrue",
                    FixedType("boolean", []),
                    [FunctionArg("value", FixedType("boolean", []))],
                    [],
                    IfStatement(
                        Value("value"),
                        Value("true"),
                        [],
                        [],
                        Value("false"),
                        []
                    ),
                    DoBlock([
                        ModuleReference(
                            ["globalThis", "console"],
                            FunctionCall("log", [StringValue("hello")])
                        ),
                        Const("x", FixedType("number", []), [], Value("5")),
                        ModuleReference(
                            ["globalThis", "console"],
                            FunctionCall("log", [Value("x")])
                        ),
                    ])
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
