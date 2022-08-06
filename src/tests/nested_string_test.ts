import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    FormatStringValue,
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
helloWorld str = str.split "\\""

goodbyeWorld: string -> List string
goodbyeWorld str = str.split \`\\\`\`
`.trim();

const multiLine = `
helloWorld: string -> List string
helloWorld str =
    str.split "\\""

goodbyeWorld: string -> List string
goodbyeWorld str =
    str.split \`\\\`\`
`.trim();

const expectedOutput = `
function helloWorld(str: string): string[] {
    return str.split("\\"");
}

function goodbyeWorld(str: string): string[] {
    return str.split(\`\\\`\`);
}
`.trim();

const expectedOutputJS = `
function helloWorld(str) {
    return str.split("\\"");
}

function goodbyeWorld(str) {
    return str.split(\`\\\`\`);
}`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, oneLine.split("\n").slice(0, 2)),
        UnparsedBlock("FunctionBlock", 3, oneLine.split("\n").slice(3, 6)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n").slice(0, 3)),
        UnparsedBlock("FunctionBlock", 4, multiLine.split("\n").slice(4, 7)),
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
                        FunctionCall("split", [ StringValue('\\"') ])
                    )
                ),

                Function(
                    "goodbyeWorld",
                    FixedType("List", [ FixedType("string", [ ]) ]),
                    [ FunctionArg("str", FixedType("string", [ ])) ],
                    [ ],
                    ModuleReference(
                        [ "str" ],
                        FunctionCall("split", [ FormatStringValue("\\`") ])
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
                        FunctionCall("split", [ StringValue('\\"') ])
                    )
                ),
                Function(
                    "goodbyeWorld",
                    FixedType("List", [ FixedType("string", [ ]) ]),
                    [ FunctionArg("str", FixedType("string", [ ])) ],
                    [ ],
                    ModuleReference(
                        [ "str" ],
                        FunctionCall("split", [ FormatStringValue("\\`") ])
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

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
