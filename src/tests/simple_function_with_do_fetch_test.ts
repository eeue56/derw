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
    GenericType,
    Module,
    ModuleReference,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
fetch: string -> any -> any
fetch url options =
    do
        response: Response
        response =
            globalThis.fetch url options
    return
        response
`.trim();

const multiLine = `
fetch: string -> any -> any
fetch url options =
    do
        response: Response
        response =
            globalThis.fetch url options
    return
        response
`.trim();

const expectedOutput = `
async function fetch(url: string, options: any): Promise<any> {
    const response: Response = await globalThis.fetch(url, options);
    return response;
}
`.trim();

const expectedOutputJS = `
async function fetch(url, options) {
    const response = await globalThis.fetch(url, options);
    return response;
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
                    "fetch",
                    GenericType("any"),
                    [
                        FunctionArg("url", FixedType("string", [])),
                        FunctionArg("options", GenericType("any")),
                    ],
                    [],
                    Value("response"),
                    DoBlock([
                        Const(
                            "response",
                            FixedType("Response", []),
                            [],
                            ModuleReference(
                                ["globalThis"],
                                FunctionCall("fetch", [
                                    Value("url"),
                                    Value("options"),
                                ])
                            )
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
                    "fetch",
                    GenericType("any"),
                    [
                        FunctionArg("url", FixedType("string", [])),
                        FunctionArg("options", GenericType("any")),
                    ],
                    [],
                    Value("response"),
                    DoBlock([
                        Const(
                            "response",
                            FixedType("Response", []),
                            [],
                            ModuleReference(
                                ["globalThis"],
                                FunctionCall("fetch", [
                                    Value("url"),
                                    Value("options"),
                                ])
                            )
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
