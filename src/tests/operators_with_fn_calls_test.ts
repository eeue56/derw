import * as assert from "@eeue56/ts-assert";
import { intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Addition,
    Const,
    Division,
    FixedType,
    FunctionCall,
    Module,
    Multiplication,
    Subtraction,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
added: number
added = 1 + (fn 2)

doublyAdded: number
doublyAdded = 1 + (fn 2) + (fn 3)

subtracted: number
subtracted = 1 - (fn 2)

doublySubtracted: number
doublySubtracted = 1 - (fn 2) - (fn 3)

divided: number
divided = 1 / (fn 2)

doublyDivided: number
doublyDivided = 1 / (fn 2) / (fn 3)

multiplied: number
multiplied = 1 * (fn 2)

doublyMultiplied: number
doublyMultiplied = 1 * (fn 2) * (fn 3)
`.trim();

const multiLine = `
added: number
added =
    1 + (fn 2)

doublyAdded: number
doublyAdded =
    1 + (fn 2) + (fn 3)

subtracted: number
subtracted =
    1 - (fn 2)

doublySubtracted: number
doublySubtracted =
    1 - (fn 2) - (fn 3)

divided: number
divided =
    1 / (fn 2)

doublyDivided: number
doublyDivided =
    1 / (fn 2) / (fn 3)

multiplied: number
multiplied =
    1 * (fn 2)

doublyMultiplied: number
doublyMultiplied =
    1 * (fn 2) * (fn 3)
    `.trim();

const expectedOutput = `
const added: number = 1 + fn(2);

const doublyAdded: number = 1 + fn(2) + fn(3);

const subtracted: number = 1 - fn(2);

const doublySubtracted: number = 1 - fn(2) - fn(3);

const divided: number = 1 / fn(2);

const doublyDivided: number = 1 / fn(2) / fn(3);

const multiplied: number = 1 * fn(2);

const doublyMultiplied: number = 1 * fn(2) * fn(3);
`.trim();

const expectedOutputJS = `
const added = 1 + fn(2);

const doublyAdded = 1 + fn(2) + fn(3);

const subtracted = 1 - fn(2);

const doublySubtracted = 1 - fn(2) - fn(3);

const divided = 1 / fn(2);

const doublyDivided = 1 / fn(2) / fn(3);

const multiplied = 1 * fn(2);

const doublyMultiplied = 1 * fn(2) * fn(3);
`.trim();

export function testIntoBlocks() {
    const lines = oneLine.split("\n");

    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, [lines[0], lines[1]]),
        UnparsedBlock("ConstBlock", 3, [lines[3], lines[4]]),
        UnparsedBlock("ConstBlock", 6, [lines[6], lines[7]]),
        UnparsedBlock("ConstBlock", 9, [lines[9], lines[10]]),
        UnparsedBlock("ConstBlock", 12, [lines[12], lines[13]]),
        UnparsedBlock("ConstBlock", 15, [lines[15], lines[16]]),
        UnparsedBlock("ConstBlock", 18, [lines[18], lines[19]]),
        UnparsedBlock("ConstBlock", 21, [lines[21], lines[22]]),
    ]);
}

export function testIntoBlocksMultiLine() {
    const lines = multiLine.split("\n");

    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, lines.slice(0, 3)),
        UnparsedBlock("ConstBlock", 4, lines.slice(4, 7)),
        UnparsedBlock("ConstBlock", 8, lines.slice(8, 11)),
        UnparsedBlock("ConstBlock", 12, lines.slice(12, 15)),
        UnparsedBlock("ConstBlock", 16, lines.slice(16, 19)),
        UnparsedBlock("ConstBlock", 20, lines.slice(20, 23)),
        UnparsedBlock("ConstBlock", 24, lines.slice(24, 27)),
        UnparsedBlock("ConstBlock", 28, lines.slice(28, 31)),
    ]);
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "added",
                    FixedType("number", []),
                    [],
                    Addition(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublyAdded",
                    FixedType("number", []),
                    [],
                    Addition(
                        Value("1"),
                        Addition(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
                    )
                ),
                Const(
                    "subtracted",
                    FixedType("number", []),
                    [],
                    Subtraction(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublySubtracted",
                    FixedType("number", []),
                    [],
                    Subtraction(
                        Value("1"),
                        Subtraction(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
                    )
                ),
                Const(
                    "divided",
                    FixedType("number", []),
                    [],
                    Division(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublyDivided",
                    FixedType("number", []),
                    [],
                    Division(
                        Value("1"),
                        Division(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
                    )
                ),
                Const(
                    "multiplied",
                    FixedType("number", []),
                    [],
                    Multiplication(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublyMultiplied",
                    FixedType("number", []),
                    [],
                    Multiplication(
                        Value("1"),
                        Multiplication(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
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
                    "added",
                    FixedType("number", []),
                    [],
                    Addition(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublyAdded",
                    FixedType("number", []),
                    [],
                    Addition(
                        Value("1"),
                        Addition(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
                    )
                ),
                Const(
                    "subtracted",
                    FixedType("number", []),
                    [],
                    Subtraction(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublySubtracted",
                    FixedType("number", []),
                    [],
                    Subtraction(
                        Value("1"),
                        Subtraction(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
                    )
                ),
                Const(
                    "divided",
                    FixedType("number", []),
                    [],
                    Division(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublyDivided",
                    FixedType("number", []),
                    [],
                    Division(
                        Value("1"),
                        Division(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
                    )
                ),
                Const(
                    "multiplied",
                    FixedType("number", []),
                    [],
                    Multiplication(Value("1"), FunctionCall("fn", [Value("2")]))
                ),
                Const(
                    "doublyMultiplied",
                    FixedType("number", []),
                    [],
                    Multiplication(
                        Value("1"),
                        Multiplication(
                            FunctionCall("fn", [Value("2")]),
                            FunctionCall("fn", [Value("3")])
                        )
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
