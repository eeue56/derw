import * as assert from "@eeue56/ts-assert";
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
        Just { value } :: Just { value: otherValue } :: rest -> Just { value: value } :: Just { value: otherValue } :: basic rest
        Nothing :: Just { value } :: rest -> Just { value: value } :: basic rest
        default -> []
`.trim();

const multiLine = `
basic: List (Maybe string) -> List (Maybe string)
basic xs =
    case xs of
        Just { value } :: Just { value: otherValue } :: rest ->
            Just { value: value } :: Just { value: otherValue } :: basic rest

        Nothing :: Just { value } :: rest ->
            Just { value: value } :: basic rest

        default ->
            [ ]
`.trim();

const expectedOutput = `
function basic(xs: Maybe<string>[]): Maybe<string>[] {
    switch (xs.length) {
        case xs.length: {
            if (xs.length >= 2) {
                const [ _0, _1, ...rest ] = xs;
                if (_0.kind === "Just" && _1.kind === "Just") {
                    const { value } = _0;
                    const { value: otherValue } = _1;
                    return [ Just({ value }), ...[ Just({ value: otherValue }), ...basic(rest) ] ];
                }
            }
        }
        case xs.length: {
            if (xs.length >= 2) {
                const [ _0, _1, ...rest ] = xs;
                if (_0.kind === "Nothing" && _1.kind === "Just") {
                    const { value } = _1;
                    return [ Just({ value }), ...basic(rest) ];
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
            if (xs.length >= 2) {
                const [ _0, _1, ...rest ] = xs;
                if (_0.kind === "Just" && _1.kind === "Just") {
                    const { value } = _0;
                    const { value: otherValue } = _1;
                    return [ Just({ value }), ...[ Just({ value: otherValue }), ...basic(rest) ] ];
                }
            }
        }
        case xs.length: {
            if (xs.length >= 2) {
                const [ _0, _1, ...rest ] = xs;
                if (_0.kind === "Nothing" && _1.kind === "Just") {
                    const { value } = _1;
                    return [ Just({ value }), ...basic(rest) ];
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
                                Destructure("Just", "{ value: otherValue }"),
                                Value("rest"),
                            ]),
                            ListPrepend(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", Value("value")),
                                    ])
                                ),
                                ListPrepend(
                                    Constructor(
                                        "Just",
                                        ObjectLiteral(null, [
                                            Field("value", Value("otherValue")),
                                        ])
                                    ),
                                    FunctionCall("basic", [ Value("rest") ])
                                )
                            ),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Nothing", ""),
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
                        Branch(Default(), ListValue([ ]), [ ]),
                    ])
                ),
            ],
            [
                "Error on lines 0 - 6\n" +
                    "Did not find constructor Just in scope.:\n" +
                    "```\n" +
                    "basic: List (Maybe string) -> List (Maybe string)\n" +
                    "basic xs =\n" +
                    "    case xs of\n" +
                    "        Just { value } :: Just { value: otherValue } :: rest -> Just { value: value } :: Just { value: otherValue } :: basic rest\n" +
                    "        Nothing :: Just { value } :: rest -> Just { value: value } :: basic rest\n" +
                    "        default -> []\n" +
                    "```",
            ]
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
                                Destructure("Just", "{ value: otherValue }"),
                                Value("rest"),
                            ]),
                            ListPrepend(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", Value("value")),
                                    ])
                                ),
                                ListPrepend(
                                    Constructor(
                                        "Just",
                                        ObjectLiteral(null, [
                                            Field("value", Value("otherValue")),
                                        ])
                                    ),
                                    FunctionCall("basic", [ Value("rest") ])
                                )
                            ),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Nothing", ""),
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
                        Branch(Default(), ListValue([ ]), [ ]),
                    ])
                ),
            ],
            [
                "Error on lines 0 - 11\n" +
                    "Did not find constructor Just in scope.:\n" +
                    "```\n" +
                    "basic: List (Maybe string) -> List (Maybe string)\n" +
                    "basic xs =\n" +
                    "    case xs of\n" +
                    "        Just { value } :: Just { value: otherValue } :: rest ->\n" +
                    "            Just { value: value } :: Just { value: otherValue } :: basic rest\n" +
                    "\n" +
                    "        Nothing :: Just { value } :: rest ->\n" +
                    "            Just { value: value } :: basic rest\n" +
                    "\n" +
                    "        default ->\n" +
                    "            [ ]\n" +
                    "```",
            ]
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
