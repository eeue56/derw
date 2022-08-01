import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    IfStatement,
    Module,
    Tag,
    TagArg,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
type Maybe a =
    Just { value: a }
    | Nothing

isTrue: Maybe a -> Maybe b
isTrue value = if value then value else value
`.trim();

const multiLine = `
type Maybe a =
    Just { value: a }
    | Nothing

isTrue: Maybe a -> Maybe b
isTrue value =
    if value then
        value
    else
        value
`.trim();

const expectedOutput = `
type Just<a> = {
    kind: "Just";
    value: a;
};

function Just<a>(args: { value: a }): Just<a> {
    return {
        kind: "Just",
        ...args,
    };
}

type Nothing = {
    kind: "Nothing";
};

function Nothing(args: {}): Nothing {
    return {
        kind: "Nothing",
        ...args,
    };
}

type Maybe<a> = Just<a> | Nothing;

function isTrue<a, b>(value: Maybe<a>): Maybe<b> {
    if (value) {
        return value;
    } else {
        return value;
    }
}
`.trim();

const expectedOutputJS = `
function Just(args) {
    return {
        kind: "Just",
        ...args,
    };
}

function Nothing(args) {
    return {
        kind: "Nothing",
        ...args,
    };
}

function isTrue(value) {
    if (value) {
        return value;
    } else {
        return value;
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionTypeBlock", 0, oneLine.split("\n").slice(0, 3)),
        UnparsedBlock("FunctionBlock", 4, oneLine.split("\n").slice(4)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionTypeBlock", 0, multiLine.split("\n").slice(0, 3)),
        UnparsedBlock("FunctionBlock", 4, multiLine.split("\n").slice(4)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("UnionType"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("UnionType"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionType(FixedType("Maybe", [ GenericType("a") ]), [
                    Tag("Just", [ TagArg("value", GenericType("a")) ]),
                    Tag("Nothing", [ ]),
                ]),
                Function(
                    "isTrue",
                    FixedType("Maybe", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    [ ],
                    IfStatement(
                        Value("value"),
                        Value("value"),
                        [ ],
                        Value("value"),
                        [ ]
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
                UnionType(FixedType("Maybe", [ GenericType("a") ]), [
                    Tag("Just", [ TagArg("value", GenericType("a")) ]),
                    Tag("Nothing", [ ]),
                ]),
                Function(
                    "isTrue",
                    FixedType("Maybe", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    [ ],
                    IfStatement(
                        Value("value"),
                        Value("value"),
                        [ ],
                        Value("value"),
                        [ ]
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
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
