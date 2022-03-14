import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    BlockKinds,
    FixedType,
    FunctionType,
    GenericType,
    Module,
    Property,
    TypeAlias,
    UnparsedBlock,
} from "../types";

const oneLine = `
type alias Program msg model = { update: msg -> model -> (msg -> void) -> model, view: model -> HtmlNode msg }
`.trim();

const multiLine = `
type alias Program msg model = {
    update: msg -> model -> (msg -> void) -> model,
    view: model -> HtmlNode msg
}
`.trim();

const expectedOutput = `
type Program<msg, model> = {
    update: (arg0: msg, arg1: model, arg2: (arg0: msg) => void) => model;
    view: (arg0: model) => HtmlNode<msg>;
}

function Program<msg, model>(args: { update: (arg0: msg, arg1: model, arg2: (arg0: msg) => void) => model, view: (arg0: model) => HtmlNode<msg> }): Program<msg, model> {
    return {
        ...args,
    };
}
`.trim();

const expectedOutputJS = `
function Program(args) {
    return {
        ...args,
    };
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine),
        Ok<string, BlockKinds>("TypeAlias")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("TypeAlias")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                TypeAlias(
                    FixedType("Program", [
                        GenericType("msg"),
                        GenericType("model"),
                    ]),
                    [
                        Property(
                            "update",
                            FunctionType([
                                GenericType("msg"),
                                GenericType("model"),
                                FunctionType([
                                    GenericType("msg"),
                                    FixedType("void", [ ]),
                                ]),
                                GenericType("model"),
                            ])
                        ),
                        Property(
                            "view",
                            FunctionType([
                                GenericType("model"),
                                FixedType("HtmlNode", [ GenericType("msg") ]),
                            ])
                        ),
                    ]
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
                TypeAlias(
                    FixedType("Program", [
                        GenericType("msg"),
                        GenericType("model"),
                    ]),
                    [
                        Property(
                            "update",
                            FunctionType([
                                GenericType("msg"),
                                GenericType("model"),
                                FunctionType([
                                    GenericType("msg"),
                                    FixedType("void", [ ]),
                                ]),
                                GenericType("model"),
                            ])
                        ),
                        Property(
                            "view",
                            FunctionType([
                                GenericType("model"),
                                FixedType("HtmlNode", [ GenericType("msg") ]),
                            ])
                        ),
                    ]
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateTypescript(parsed), expectedOutput);
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
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
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
