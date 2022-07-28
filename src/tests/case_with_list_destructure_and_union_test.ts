import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
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
    ListDestructure,
    ListPrepend,
    ListValue,
    Module,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
basic: List (Maybe string) -> List (Maybe string)
basic xs =
    case xs of
        Just { value } :: rest -> Just { value: value } :: basic rest
        Nothing :: rest -> basic rest
        default -> []
`.trim();

const multiLine = `
basic: List (Maybe string) -> List (Maybe string)
basic xs =
    case xs of
        Just { value } :: rest ->
            Just { value: value } :: basic rest

        Nothing :: rest ->
            basic rest

        default ->
            []
`.trim();

const expectedOutput = `
function basic(xs: Maybe<string>[]): Maybe<string>[] {
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
        UnparsedBlock("FunctionBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
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
