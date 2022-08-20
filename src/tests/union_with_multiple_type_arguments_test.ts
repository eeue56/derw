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
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    Module,
    ObjectLiteral,
    StringValue,
    Tag,
    TagArg,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
type Either a b = Left { value: a } | Right { value: b }

value: Either number string
value =
    Left { value: 1 }

fn: boolean -> Either number string
fn b =
    Right { value: "hello" }
`.trim();

const multiLine = `
type Either a b =
    Left { value: a }
    | Right { value: b }

value: Either number string
value =
    Left { value: 1 }

fn: boolean -> Either number string
fn b =
    Right { value: "hello" }
`.trim();

const expectedOutput = `
type Left<a> = {
    kind: "Left";
    value: a;
};

function Left<a>(args: { value: a }): Left<a> {
    return {
        kind: "Left",
        ...args,
    };
}

type Right<b> = {
    kind: "Right";
    value: b;
};

function Right<b>(args: { value: b }): Right<b> {
    return {
        kind: "Right",
        ...args,
    };
}

type Either<a, b> = Left<a> | Right<b>;

const value: Either<number, string> = Left({ value: 1 });

function fn(b: boolean): Either<number, string> {
    return Right({ value: "hello" });
}
`.trim();

const expectedOutputJS = `
function Left(args) {
    return {
        kind: "Left",
        ...args,
    };
}

function Right(args) {
    return {
        kind: "Right",
        ...args,
    };
}

const value = Left({ value: 1 });

function fn(b) {
    return Right({ value: "hello" });
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionTypeBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("ConstBlock", 2, oneLine.split("\n").slice(2, 5)),
        UnparsedBlock("FunctionBlock", 6, oneLine.split("\n").slice(6)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionTypeBlock", 0, multiLine.split("\n").slice(0, 3)),
        UnparsedBlock("ConstBlock", 4, multiLine.split("\n").slice(4, 7)),
        UnparsedBlock("FunctionBlock", 8, multiLine.split("\n").slice(8)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine.split("\n").slice(0, 1).join("\n")),
        Ok("UnionType")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine.split("\n").slice(0, 3).join("\n")),
        Ok("UnionType")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionType(
                    FixedType("Either", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("Left", [ TagArg("value", GenericType("a")) ]),
                        Tag("Right", [ TagArg("value", GenericType("b")) ]),
                    ]
                ),
                Const(
                    "value",
                    FixedType("Either", [
                        FixedType("number", [ ]),
                        FixedType("string", [ ]),
                    ]),
                    [ ],
                    Constructor(
                        "Left",
                        ObjectLiteral(null, [ Field("value", Value("1")) ])
                    )
                ),
                Function(
                    "fn",
                    FixedType("Either", [
                        FixedType("number", [ ]),
                        FixedType("string", [ ]),
                    ]),
                    [ FunctionArg("b", FixedType("boolean", [ ])) ],
                    [ ],
                    Constructor(
                        "Right",
                        ObjectLiteral(null, [
                            Field("value", StringValue("hello")),
                        ])
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
                UnionType(
                    FixedType("Either", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("Left", [ TagArg("value", GenericType("a")) ]),
                        Tag("Right", [ TagArg("value", GenericType("b")) ]),
                    ]
                ),
                Const(
                    "value",
                    FixedType("Either", [
                        FixedType("number", [ ]),
                        FixedType("string", [ ]),
                    ]),
                    [ ],
                    Constructor(
                        "Left",
                        ObjectLiteral(null, [ Field("value", Value("1")) ])
                    )
                ),
                Function(
                    "fn",
                    FixedType("Either", [
                        FixedType("number", [ ]),
                        FixedType("string", [ ]),
                    ]),
                    [ FunctionArg("b", FixedType("boolean", [ ])) ],
                    [ ],
                    Constructor(
                        "Right",
                        ObjectLiteral(null, [
                            Field("value", StringValue("hello")),
                        ])
                    )
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
