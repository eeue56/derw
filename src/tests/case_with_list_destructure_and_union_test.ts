import * as assert from "@eeue56/ts-assert";
import { Just } from "@eeue56/ts-core/build/main/lib/maybe";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Branch,
    CaseStatement,
    Constructor,
    Default,
    Destructure,
    Field,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    Import,
    ImportModule,
    ListDestructure,
    ListPrepend,
    ListValue,
    Module,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
import "../Maybe" as Maybe exposing ( Maybe, Just, Nothing )

basic: List (Maybe string) -> List (Maybe string)
basic xs =
    case xs of
        Just { value } :: rest -> Just { value: value } :: basic rest
        Nothing :: rest -> basic rest
        default -> []
`.trim();

const multiLine = `
import "../Maybe" as Maybe exposing ( Maybe, Just, Nothing )

basic: List (Maybe string) -> List (Maybe string)
basic xs =
    case xs of
        Just { value } :: rest ->
            Just { value: value } :: basic rest

        Nothing :: rest ->
            basic rest

        default ->
            [ ]
`.trim();

const expectedOutput = `
import * as Maybe from "../Maybe";
import { Just, Nothing } from "../Maybe";

function basic(xs: Maybe.Maybe<string>[]): Maybe.Maybe<string>[] {
    switch (xs.length) {
        case xs.length: {
            if (xs.length >= 1) {
                const [ _0, ...rest ] = xs;
                if (_0.kind === "Just") {
                    const { value } = _0;
                    return [ Just({ value }), ...basic(rest) ];
                }
            }
        }
        case xs.length: {
            if (xs.length >= 1) {
                const [ _0, ...rest ] = xs;
                if (_0.kind === "Nothing") {
                    return basic(rest);
                }
            }
        }
        default: {
            return [ ];
        }
    }
}
`.trim();

const expectedOutputJS = `
import * as Maybe from "../Maybe";
import { Just, Nothing } from "../Maybe";

function basic(xs) {
    switch (xs.length) {
        case xs.length: {
            if (xs.length >= 1) {
                const [ _0, ...rest ] = xs;
                if (_0.kind === "Just") {
                    const { value } = _0;
                    return [ Just({ value }), ...basic(rest) ];
                }
            }
        }
        case xs.length: {
            if (xs.length >= 1) {
                const [ _0, ...rest ] = xs;
                if (_0.kind === "Nothing") {
                    return basic(rest);
                }
            }
        }
        default: {
            return [ ];
        }
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ImportBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("FunctionBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ImportBlock", 0, multiLine.split("\n").slice(0, 1)),
        UnparsedBlock("FunctionBlock", 2, multiLine.split("\n").slice(2)),
    ]);
}

export function testBlockKind() {
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Import"), Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Import"), Ok("Function") ]
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Import([
                    ImportModule(
                        '"../Maybe"',
                        Just("Maybe"),
                        [ "Maybe", "Just", "Nothing" ],
                        "Relative"
                    ),
                ]),
                Function(
                    "basic",
                    FixedType("List", [
                        FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [
                                FixedType("Maybe", [
                                    FixedType("string", [ ]),
                                ]),
                            ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("xs"), [
                        Branch(
                            ListDestructure([
                                Destructure("Just", "{ value }"),
                                Value("rest"),
                            ]),
                            ListPrepend(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", Value("value")),
                                    ])
                                ),
                                FunctionCall("basic", [ Value("rest") ])
                            ),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Nothing", ""),
                                Value("rest"),
                            ]),
                            FunctionCall("basic", [ Value("rest") ]),
                            [ ]
                        ),
                        Branch(Default(), ListValue([ ]), [ ]),
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
                Import([
                    ImportModule(
                        '"../Maybe"',
                        Just("Maybe"),
                        [ "Maybe", "Just", "Nothing" ],
                        "Relative"
                    ),
                ]),
                Function(
                    "basic",
                    FixedType("List", [
                        FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [
                                FixedType("Maybe", [
                                    FixedType("string", [ ]),
                                ]),
                            ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("xs"), [
                        Branch(
                            ListDestructure([
                                Destructure("Just", "{ value }"),
                                Value("rest"),
                            ]),
                            ListPrepend(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", Value("value")),
                                    ])
                                ),
                                FunctionCall("basic", [ Value("rest") ])
                            ),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Nothing", ""),
                                Value("rest"),
                            ]),
                            FunctionCall("basic", [ Value("rest") ]),
                            [ ]
                        ),
                        Branch(Default(), ListValue([ ]), [ ]),
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
