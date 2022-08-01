import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Addition,
    Field,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    GenericType,
    Module,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
repeat: number -> any
repeat x = fn something x { x: x + 1 }
`.trim();

const multiLine = `
repeat: number -> any
repeat x =
    fn something x {
        x: x + 1
    }
`.trim();

const expectedOutput = `
function repeat(x: number): any {
    return fn(something, x, { x: x + 1 });
}
`.trim();

const expectedOutputJS = `
function repeat(x) {
    return fn(something, x, { x: x + 1 });
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
                    "repeat",
                    GenericType("any"),
                    [ FunctionArg("x", FixedType("number", [ ])) ],
                    [ ],
                    FunctionCall("fn", [
                        Value("something"),
                        Value("x"),
                        ObjectLiteral(null, [
                            Field("x", Addition(Value("x"), Value("1"))),
                        ]),
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
                Function(
                    "repeat",
                    GenericType("any"),
                    [ FunctionArg("x", FixedType("number", [ ])) ],
                    [ ],
                    FunctionCall("fn", [
                        Value("something"),
                        Value("x"),
                        ObjectLiteral(null, [
                            Field("x", Addition(Value("x"), Value("1"))),
                        ]),
                    ])
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
