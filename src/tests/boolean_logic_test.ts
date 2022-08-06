import * as assert from "@eeue56/ts-assert";
import { intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    And,
    Const,
    Equality,
    FixedType,
    Function,
    FunctionArg,
    GreaterThan,
    GreaterThanOrEqual,
    InEquality,
    LessThan,
    LessThanOrEqual,
    Module,
    Or,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isEqual: boolean
isEqual = 1 == 2

isNotEqual: boolean
isNotEqual = 1 != 2

isLessThan: boolean
isLessThan = 1 < 2

isLessThanOrEqual: boolean
isLessThanOrEqual = 1 <= 2

isGreaterThan: boolean
isGreaterThan = 1 > 2

isGreaterThanOrEqual: boolean
isGreaterThanOrEqual = 1 >= 2

equalityFunction: number -> number -> boolean
equalityFunction x y = x == y

and: boolean -> boolean -> boolean
and a b = a && b

or: boolean -> boolean -> boolean
or a b = a || b
`.trim();

const multiLine = `
isEqual: boolean
isEqual =
    1 == 2

isNotEqual: boolean
isNotEqual =
    1 != 2

isLessThan: boolean
isLessThan =
    1 < 2

isLessThanOrEqual: boolean
isLessThanOrEqual =
    1 <= 2

isGreaterThan: boolean
isGreaterThan =
    1 > 2

isGreaterThanOrEqual: boolean
isGreaterThanOrEqual =
    1 >= 2

equalityFunction: number -> number -> boolean
equalityFunction x y =
    x == y

and: boolean -> boolean -> boolean
and a b =
    a && b

or: boolean -> boolean -> boolean
or a b =
    a || b
`.trim();

const expectedOutput = `
const isEqual: boolean = 1 === 2;

const isNotEqual: boolean = 1 !== 2;

const isLessThan: boolean = 1 < 2;

const isLessThanOrEqual: boolean = 1 <= 2;

const isGreaterThan: boolean = 1 > 2;

const isGreaterThanOrEqual: boolean = 1 >= 2;

function equalityFunction(x: number, y: number): boolean {
    return x === y;
}

function and(a: boolean, b: boolean): boolean {
    return a && b;
}

function or(a: boolean, b: boolean): boolean {
    return a || b;
}
`.trim();

const expectedOutputJS = `
const isEqual = 1 === 2;

const isNotEqual = 1 !== 2;

const isLessThan = 1 < 2;

const isLessThanOrEqual = 1 <= 2;

const isGreaterThan = 1 > 2;

const isGreaterThanOrEqual = 1 >= 2;

function equalityFunction(x, y) {
    return x === y;
}

function and(a, b) {
    return a && b;
}

function or(a, b) {
    return a || b;
}
`.trim();

export function testIntoBlocks() {
    const lines = oneLine.split("\n");

    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, [ lines[0], lines[1] ]),
        UnparsedBlock("ConstBlock", 3, [ lines[3], lines[4] ]),
        UnparsedBlock("ConstBlock", 6, [ lines[6], lines[7] ]),
        UnparsedBlock("ConstBlock", 9, [ lines[9], lines[10] ]),
        UnparsedBlock("ConstBlock", 12, [ lines[12], lines[13] ]),
        UnparsedBlock("ConstBlock", 15, [ lines[15], lines[16] ]),
        UnparsedBlock("FunctionBlock", 18, [ lines[18], lines[19] ]),
        UnparsedBlock("FunctionBlock", 21, [ lines[21], lines[22] ]),
        UnparsedBlock("FunctionBlock", 24, [ lines[24], lines[25] ]),
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
        UnparsedBlock("FunctionBlock", 24, lines.slice(24, 27)),
        UnparsedBlock("FunctionBlock", 28, lines.slice(28, 31)),
        UnparsedBlock("FunctionBlock", 32, lines.slice(32, 35)),
    ]);
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "isEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    Equality(Value("1"), Value("2"))
                ),

                Const(
                    "isNotEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    InEquality(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThan",
                    FixedType("boolean", [ ]),
                    [ ],
                    LessThan(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThanOrEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    LessThanOrEqual(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThan",
                    FixedType("boolean", [ ]),
                    [ ],
                    GreaterThan(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThanOrEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    GreaterThanOrEqual(Value("1"), Value("2"))
                ),

                Function(
                    "equalityFunction",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Equality(Value("x"), Value("y"))
                ),

                Function(
                    "and",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("a", FixedType("boolean", [ ])),
                        FunctionArg("b", FixedType("boolean", [ ])),
                    ],
                    [ ],
                    And(Value("a"), Value("b"))
                ),

                Function(
                    "or",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("a", FixedType("boolean", [ ])),
                        FunctionArg("b", FixedType("boolean", [ ])),
                    ],
                    [ ],
                    Or(Value("a"), Value("b"))
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
                    "isEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    Equality(Value("1"), Value("2"))
                ),

                Const(
                    "isNotEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    InEquality(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThan",
                    FixedType("boolean", [ ]),
                    [ ],
                    LessThan(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThanOrEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    LessThanOrEqual(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThan",
                    FixedType("boolean", [ ]),
                    [ ],
                    GreaterThan(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThanOrEqual",
                    FixedType("boolean", [ ]),
                    [ ],
                    GreaterThanOrEqual(Value("1"), Value("2"))
                ),

                Function(
                    "equalityFunction",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Equality(Value("x"), Value("y"))
                ),

                Function(
                    "and",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("a", FixedType("boolean", [ ])),
                        FunctionArg("b", FixedType("boolean", [ ])),
                    ],
                    [ ],
                    And(Value("a"), Value("b"))
                ),

                Function(
                    "or",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("a", FixedType("boolean", [ ])),
                        FunctionArg("b", FixedType("boolean", [ ])),
                    ],
                    [ ],
                    Or(Value("a"), Value("b"))
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
