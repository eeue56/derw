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
    Constructor,
    Field,
    FunctionCall,
    GenericType,
    Module,
    ObjectLiteral,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
x: any
x =
    { age: fn 1 (FixedType { name: "Hello" }) }
`.trim();

const multiLine = `
x: any
x =
    { age: fn 1 (FixedType { name: "Hello" }) }
`.trim();

const expectedOutput = `
const x: any = { age: fn(1, FixedType({ name: "Hello" })) };
`.trim();

const expectedOutputJS = `
const x = { age: fn(1, FixedType({ name: "Hello" })) };
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
                    "x",
                    GenericType("any"),
                    [ ],
                    ObjectLiteral(null, [
                        Field(
                            "age",
                            FunctionCall("fn", [
                                Value("1"),
                                Constructor(
                                    "FixedType",
                                    ObjectLiteral(null, [
                                        Field("name", StringValue("Hello")),
                                    ])
                                ),
                            ])
                        ),
                    ])
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
                Const(
                    "x",
                    GenericType("any"),
                    [ ],
                    ObjectLiteral(null, [
                        Field(
                            "age",
                            FunctionCall("fn", [
                                Value("1"),
                                Constructor(
                                    "FixedType",
                                    ObjectLiteral(null, [
                                        Field("name", StringValue("Hello")),
                                    ])
                                ),
                            ])
                        ),
                    ])
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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
