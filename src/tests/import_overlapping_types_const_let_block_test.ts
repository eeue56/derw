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
    Field,
    FixedType,
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

something: Maybe string
something =
    let
        result: Maybe string
        result =
            Just { value: "hello" }
    in
        result
`.trim();

const multiLine = `
import "./Maybe" as Maybe exposing ( Maybe, Just, Nothing )

something: Maybe string
something =
    let
        result: Maybe string
        result =
            Just { value: "hello" }
    in
        result
`.trim();

const expectedOutput = `
import * as Maybe from "./Maybe";
import { Just, Nothing } from "./Maybe";

const something: Maybe.Maybe<string> = (function(): Maybe.Maybe<string> {
    const result: Maybe.Maybe<string> = Just({ value: "hello" });
    return result;
})();
`.trim();

const expectedOutputJS = `
import * as Maybe from "./Maybe";
import { Just, Nothing } from "./Maybe";

const something = (function() {
    const result = Just({ value: "hello" });
    return result;
})();
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ImportBlock", 0, [ oneLine.split("\n")[0] ]),
        UnparsedBlock("ConstBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ImportBlock", 0, [ multiLine.split("\n")[0] ]),
        UnparsedBlock("ConstBlock", 2, multiLine.split("\n").slice(2)),
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
                Const(
                    "something",
                    FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    [
                        Const(
                            "result",
                            FixedType("Maybe", [ FixedType("string", [ ]) ]),
                            [ ],
                            Constructor(
                                "Just",
                                ObjectLiteral(null, [
                                    Field("value", StringValue("hello")),
                                ])
                            )
                        ),
                    ],
                    Value("result")
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
                Const(
                    "something",
                    FixedType("Maybe", [ FixedType("string", [ ]) ]),
                    [
                        Const(
                            "result",
                            FixedType("Maybe", [ FixedType("string", [ ]) ]),
                            [ ],
                            Constructor(
                                "Just",
                                ObjectLiteral(null, [
                                    Field("value", StringValue("hello")),
                                ])
                            )
                        ),
                    ],
                    Value("result")
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
