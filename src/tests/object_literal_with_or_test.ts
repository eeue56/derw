import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    BlockKinds,
    Const,
    Field,
    FunctionCall,
    GenericType,
    Lambda,
    ListValue,
    Module,
    ModuleReference,
    ObjectLiteral,
    Or,
    StringValue,
    UnparsedBlock,
} from "../types";

const oneLine = `
fun: any
fun = [ { test: (\\x -> x.startsWith " " || x.startsWith "}") } ]
`.trim();

const multiLine = `
fun: any
fun =
    [ {
        test: (\\x -> x.startsWith " " || x.startsWith "}")
    } ]
`.trim();

const expectedOutput = `
const fun: any = [ { test: function(x: any) {
    return x.startsWith(" ") || x.startsWith("}");
} } ];
`.trim();

const expectedOutputJS = `
const fun = [ { test: function(x) {
    return x.startsWith(" ") || x.startsWith("}");
} } ];
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok<string, BlockKinds>("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("Const")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "fun",
                    GenericType("any"),
                    [ ],
                    ListValue([
                        ObjectLiteral(null, [
                            Field(
                                "test",
                                Lambda(
                                    [ "x" ],
                                    Or(
                                        ModuleReference(
                                            [ "x" ],
                                            FunctionCall("startsWith", [
                                                StringValue(" "),
                                            ])
                                        ),
                                        ModuleReference(
                                            [ "x" ],
                                            FunctionCall("startsWith", [
                                                StringValue("}"),
                                            ])
                                        )
                                    )
                                )
                            ),
                        ]),
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
                Const(
                    "fun",
                    GenericType("any"),
                    [ ],
                    ListValue([
                        ObjectLiteral(null, [
                            Field(
                                "test",
                                Lambda(
                                    [ "x" ],
                                    Or(
                                        ModuleReference(
                                            [ "x" ],
                                            FunctionCall("startsWith", [
                                                StringValue(" "),
                                            ])
                                        ),
                                        ModuleReference(
                                            [ "x" ],
                                            FunctionCall("startsWith", [
                                                StringValue("}"),
                                            ])
                                        )
                                    )
                                )
                            ),
                        ]),
                    ])
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
