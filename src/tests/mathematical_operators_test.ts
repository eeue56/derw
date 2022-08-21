import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Addition,
    Division,
    FixedType,
    Function,
    FunctionArg,
    Mod,
    Module,
    Multiplication,
    Subtraction,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
add: number -> number -> number
add x y = x + y

sub: number -> number -> number
sub x y = x - y

mod: number -> number -> number
mod x y = x % y

addThree: number -> number -> number -> number
addThree x y z = x + y + z

mixOperators: number -> number -> number -> number
mixOperators x y z = x + y - z * x / y
`.trim();

const multiLine = `
add: number -> number -> number
add x y =
    x + y

sub: number -> number -> number
sub x y =
    x - y

mod: number -> number -> number
mod x y =
    x % y

addThree: number -> number -> number -> number
addThree x y z =
    x + y + z

mixOperators: number -> number -> number -> number
mixOperators x y z =
    x + y - z * x / y
`.trim();

const expectedOutput = `
function add(x: number, y: number): number {
    return x + y;
}

function sub(x: number, y: number): number {
    return x - y;
}

function mod(x: number, y: number): number {
    return x % y;
}

function addThree(x: number, y: number, z: number): number {
    return x + y + z;
}

function mixOperators(x: number, y: number, z: number): number {
    return x + y - z * x / y;
}
`.trim();

const expectedOutputJS = `
function add(x, y) {
    return x + y;
}

function sub(x, y) {
    return x - y;
}

function mod(x, y) {
    return x % y;
}

function addThree(x, y, z) {
    return x + y + z;
}

function mixOperators(x, y, z) {
    return x + y - z * x / y;
}
`.trim();

export function testIntoBlocks() {
    const split = oneLine.split("\n");
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, split.slice(0, 2)),
        UnparsedBlock("FunctionBlock", 3, split.slice(3, 5)),
        UnparsedBlock("FunctionBlock", 6, split.slice(6, 8)),
        UnparsedBlock("FunctionBlock", 9, split.slice(9, 11)),
        UnparsedBlock("FunctionBlock", 12, split.slice(12, 14)),
    ]);
}

export function testIntoBlocksMultiLine() {
    const split = multiLine.split("\n");
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, split.slice(0, 3)),
        UnparsedBlock("FunctionBlock", 4, split.slice(4, 7)),
        UnparsedBlock("FunctionBlock", 8, split.slice(8, 11)),
        UnparsedBlock("FunctionBlock", 12, split.slice(12, 15)),
        UnparsedBlock("FunctionBlock", 16, split.slice(16, 19)),
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
                    "add",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Addition(Value("x"), Value("y"))
                ),
                Function(
                    "sub",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Subtraction(Value("x"), Value("y"))
                ),
                Function(
                    "mod",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Mod(Value("x"), Value("y"))
                ),
                Function(
                    "addThree",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    [ ],
                    Addition(Value("x"), Addition(Value("y"), Value("z")))
                ),
                Function(
                    "mixOperators",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    [ ],
                    Addition(
                        Value("x"),
                        Subtraction(
                            Value("y"),
                            Multiplication(
                                Value("z"),
                                Division(Value("x"), Value("y"))
                            )
                        )
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
                    "add",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Addition(Value("x"), Value("y"))
                ),
                Function(
                    "sub",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Subtraction(Value("x"), Value("y"))
                ),
                Function(
                    "mod",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    [ ],
                    Mod(Value("x"), Value("y"))
                ),
                Function(
                    "addThree",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    [ ],
                    Addition(Value("x"), Addition(Value("y"), Value("z")))
                ),
                Function(
                    "mixOperators",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    [ ],
                    Addition(
                        Value("x"),
                        Subtraction(
                            Value("y"),
                            Multiplication(
                                Value("z"),
                                Division(Value("x"), Value("y"))
                            )
                        )
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
