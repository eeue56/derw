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
    BlockKinds,
    Const,
    Constructor,
    DoBlock,
    Field,
    FixedType,
    Function,
    FunctionArg,
    Import,
    ImportModule,
    Module,
    ObjectLiteral,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
import "./Maybe" as Maybe exposing (Maybe, Just, Nothing)

makeSomething: string -> Maybe string
makeSomething name =
    do
        something: Maybe string
        something =
            Just { value: "hello" }
    return
        Just { value: name }
`.trim();

const multiLine = `
import "./Maybe" as Maybe exposing ( Maybe, Just, Nothing )

makeSomething: string -> Maybe string
makeSomething name =
    do
        something: Maybe string
        something =
            Just { value: "hello" }
    return
        Just { value: name }
`.trim();

const expectedOutput = `
import * as Maybe from "./Maybe";
import { Just, Nothing } from "./Maybe";

async function makeSomething(name: string): Promise<Maybe.Maybe<string>> {
    const something: Maybe.Maybe<string> = await Just({ value: "hello" });
    return Just({ value: name });
}
`.trim();

const expectedOutputJS = `
import * as Maybe from "./Maybe";
import { Just, Nothing } from "./Maybe";

async function makeSomething(name) {
    const something = await Just({ value: "hello" });
    return Just({ value: name });
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ImportBlock", 0, [ oneLine.split("\n")[0] ]),
        UnparsedBlock("FunctionBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ImportBlock", 0, [ multiLine.split("\n")[0] ]),
        UnparsedBlock("FunctionBlock", 2, multiLine.split("\n").slice(2)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine),
        Ok<string, BlockKinds>("Import")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("Import")
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
                        `"./Maybe"`,
                        Just("Maybe"),
                        [ "Maybe", "Just", "Nothing" ],
                        "Relative"
                    ),
                ]),
                Function(
                    "makeSomething",
                    FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    [ FunctionArg("name", FixedType("string", [ ])) ],
                    [ ],
                    Constructor(
                        "Just",
                        ObjectLiteral(null, [ Field("value", Value("name")) ])
                    ),
                    DoBlock([
                        Const(
                            "something",
                            FixedType("Maybe", [ FixedType("string", [ ]) ]),
                            [ ],
                            Constructor(
                                "Just",
                                ObjectLiteral(null, [
                                    Field("value", StringValue("hello")),
                                ])
                            )
                        ),
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
                        `"./Maybe"`,
                        Just("Maybe"),
                        [ "Maybe", "Just", "Nothing" ],
                        "Relative"
                    ),
                ]),
                Function(
                    "makeSomething",
                    FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    [ FunctionArg("name", FixedType("string", [ ])) ],
                    [ ],
                    Constructor(
                        "Just",
                        ObjectLiteral(null, [ Field("value", Value("name")) ])
                    ),
                    DoBlock([
                        Const(
                            "something",
                            FixedType("Maybe", [ FixedType("string", [ ]) ]),
                            [ ],
                            Constructor(
                                "Just",
                                ObjectLiteral(null, [
                                    Field("value", StringValue("hello")),
                                ])
                            )
                        ),
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

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
