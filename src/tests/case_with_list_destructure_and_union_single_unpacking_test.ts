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
    Default,
    Destructure,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    ListDestructure,
    ListPrepend,
    ListValue,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
capture: List Token -> List string
capture tokens =
    case tokens of
        Speech :: chars :: Speech :: rest -> charsToString chars :: capture rest
        Speech :: rest -> [ ]
        Char { char } :: rest -> capture rest
        default -> [ ]
`.trim();

const multiLine = `
capture: List Token -> List string
capture tokens =
    case tokens of
        Speech :: chars :: Speech :: rest ->
            charsToString chars :: capture rest

        Speech :: rest ->
            [ ]

        Char { char } :: rest ->
            capture rest

        default ->
            [ ]
`.trim();

const expectedOutput = `
function capture(tokens: Token[]): string[] {
    switch (tokens.length) {
        case tokens.length: {
            if (tokens.length >= 2) {
                const [ _0, ..._rest ] = tokens;
                if (_0.kind === "Speech") {
                    let _foundIndex: number = -1;
                    for (let _i = 0; _i < _rest.length; _i++) {
                        if (_rest[_i].kind === "Speech") {
                            _foundIndex = _i;
                            break;
                        }
                    }

                    if (_foundIndex > -1) {
                        const chars = _rest.slice(0, _foundIndex);
                        const rest = _rest.slice(_foundIndex, _rest.length);
                        return [ charsToString(chars), ...capture(rest) ];
                    }
                }
            }
        }
        case tokens.length: {
            if (tokens.length >= 1) {
                const [ _0, ...rest ] = tokens;
                if (_0.kind === "Speech") {
                    return [ ];
                }
            }
        }
        case tokens.length: {
            if (tokens.length >= 1) {
                const [ _0, ...rest ] = tokens;
                if (_0.kind === "Char") {
                    const { char } = _0;
                    return capture(rest);
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
function capture(tokens) {
    switch (tokens.length) {
        case tokens.length: {
            if (tokens.length >= 2) {
                const [ _0, ..._rest ] = tokens;
                if (_0.kind === "Speech") {
                    let _foundIndex = -1;
                    for (let _i = 0; _i < _rest.length; _i++) {
                        if (_rest[_i].kind === "Speech") {
                            _foundIndex = _i;
                            break;
                        }
                    }

                    if (_foundIndex > -1) {
                        const chars = _rest.slice(0, _foundIndex);
                        const rest = _rest.slice(_foundIndex, _rest.length);
                        return [ charsToString(chars), ...capture(rest) ];
                    }
                }
            }
        }
        case tokens.length: {
            if (tokens.length >= 1) {
                const [ _0, ...rest ] = tokens;
                if (_0.kind === "Speech") {
                    return [ ];
                }
            }
        }
        case tokens.length: {
            if (tokens.length >= 1) {
                const [ _0, ...rest ] = tokens;
                if (_0.kind === "Char") {
                    const { char } = _0;
                    return capture(rest);
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
                    "capture",
                    FixedType("List", [ FixedType("string", [ ]) ]),
                    [
                        FunctionArg(
                            "tokens",
                            FixedType("List", [ FixedType("Token", [ ]) ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("tokens"), [
                        Branch(
                            ListDestructure([
                                Destructure("Speech", ""),
                                Value("chars"),
                                Destructure("Speech", ""),
                                Value("rest"),
                            ]),
                            ListPrepend(
                                FunctionCall("charsToString", [
                                    Value("chars"),
                                ]),
                                FunctionCall("capture", [ Value("rest") ])
                            ),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Speech", ""),
                                Value("rest"),
                            ]),
                            ListValue([ ]),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Char", "{ char }"),
                                Value("rest"),
                            ]),
                            FunctionCall("capture", [ Value("rest") ]),
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
                    "capture",
                    FixedType("List", [ FixedType("string", [ ]) ]),
                    [
                        FunctionArg(
                            "tokens",
                            FixedType("List", [ FixedType("Token", [ ]) ])
                        ),
                    ],
                    [ ],
                    CaseStatement(Value("tokens"), [
                        Branch(
                            ListDestructure([
                                Destructure("Speech", ""),
                                Value("chars"),
                                Destructure("Speech", ""),
                                Value("rest"),
                            ]),
                            ListPrepend(
                                FunctionCall("charsToString", [
                                    Value("chars"),
                                ]),
                                FunctionCall("capture", [ Value("rest") ])
                            ),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Speech", ""),
                                Value("rest"),
                            ]),
                            ListValue([ ]),
                            [ ]
                        ),
                        Branch(
                            ListDestructure([
                                Destructure("Char", "{ char }"),
                                Value("rest"),
                            ]),
                            FunctionCall("capture", [ Value("rest") ]),
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
