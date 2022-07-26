import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    Module,
    ModuleReference,
    StringValue,
    UnparsedBlock,
} from "../types";

const oneLine = `
helloWorld: string -> List string
helloWorld str = str.split " "
`.trim();

const multiLine = `
helloWorld: string -> List string
helloWorld str =
    str.split " "
`.trim();

const expectedOutput = `
function helloWorld(str: string): string[] {
    return str.split(" ");
}
`.trim();

const expectedOutputJS = `
function helloWorld(str) {
    return str.split(" ");
}`.trim();

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
                    "helloWorld",
                    FixedType("List", [ FixedType("string", [ ]) ]),
                    [ FunctionArg("str", FixedType("string", [ ])) ],
                    [ ],
                    ModuleReference(
                        [ "str" ],
                        FunctionCall("split", [ StringValue(" ") ])
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
                    "helloWorld",
                    FixedType("List", [ FixedType("string", [ ]) ]),
                    [ FunctionArg("str", FixedType("string", [ ])) ],
                    [ ],
                    ModuleReference(
                        [ "str" ],
                        FunctionCall("split", [ StringValue(" ") ])
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
