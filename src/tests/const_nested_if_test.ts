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
    Equality,
    FixedType,
    IfStatement,
    Module,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
name: string
name =
    if 1 == 1 then
        if 2 == 2 then
            "Noah"
        else
            "Mary"
    else
        "James"
`.trim();

const multiLine = `
name: string
name =
    if 1 == 1 then
        if 2 == 2 then
            "Noah"
        else
            "Mary"
    else
        "James"
`.trim();

const expectedOutput = `
const name: string = 1 === 1 ? ( 2 === 2 ? "Noah" : "Mary" ) : "James";
`.trim();

const expectedOutputJS = `
const name = 1 === 1 ? ( 2 === 2 ? "Noah" : "Mary" ) : "James";
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Const"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "name",
                    FixedType("string", []),
                    [],
                    IfStatement(
                        Equality(Value("1"), Value("1")),
                        IfStatement(
                            Equality(Value("2"), Value("2")),
                            StringValue("Noah"),
                            [],
                            [],
                            StringValue("Mary"),
                            []
                        ),
                        [],
                        [],
                        StringValue("James"),
                        []
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
                Const(
                    "name",
                    FixedType("string", []),
                    [],
                    IfStatement(
                        Equality(Value("1"), Value("1")),
                        IfStatement(
                            Equality(Value("2"), Value("2")),
                            StringValue("Noah"),
                            [],
                            [],
                            StringValue("Mary"),
                            []
                        ),
                        [],
                        [],
                        StringValue("James"),
                        []
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
