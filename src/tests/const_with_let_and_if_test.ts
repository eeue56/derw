import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Const,
    FixedType,
    IfStatement,
    Module,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
name: string
name =
    let
        rootName: string
        rootName = if true then "noah" else "james"
    in
        rootName
`.trim();

const multiLine = `
name: string
name =
    let
        rootName: string
        rootName =
            if true then
                "noah"
            else
                "james"
    in
        rootName
`.trim();

const expectedOutput = `
const name: string = (function(): string {
    const rootName: string = true ? "noah" : "james";
    return rootName;
})();
`.trim();

const expectedOutputJS = `
const name = (function() {
    const rootName = true ? "noah" : "james";
    return rootName;
})();
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
    assert.deepStrictEqual(blockKind(oneLine), Ok("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Const"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "name",
                    FixedType("string", [ ]),
                    [
                        Const(
                            "rootName",
                            FixedType("string", [ ]),
                            [ ],
                            IfStatement(
                                Value("true"),
                                StringValue("noah"),
                                [ ],
                                StringValue("james"),
                                [ ]
                            )
                        ),
                    ],
                    Value("rootName")
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
                    "name",
                    FixedType("string", [ ]),
                    [
                        Const(
                            "rootName",
                            FixedType("string", [ ]),
                            [ ],
                            IfStatement(
                                Value("true"),
                                StringValue("noah"),
                                [ ],
                                StringValue("james"),
                                [ ]
                            )
                        ),
                    ],
                    Value("rootName")
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
