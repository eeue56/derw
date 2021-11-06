import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    Const,
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    IfStatement,
    ListValue,
    Module,
    StringValue,
    Tag,
    Type,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

import { blockKind, intoBlocks } from "../blocks";
import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";

const oneLine = `
helloWorld: List (List number)
helloWorld = [ [ 1, 2, 3 ], [ 3, 2, 1 ] ]
`.trim();

const multiLine = `
helloWorld: List (List number)
helloWorld =
    [
        [ 1, 2, 3 ],
        [ 3, 2, 1 ]
    ]
`.trim();

const expectedOutput = `
const helloWorld: number[][] = [ [ 1, 2, 3 ], [ 3, 2, 1 ] ];
`.trim();

const expectedOutputJS = `
const helloWorld = [ [ 1, 2, 3 ], [ 3, 2, 1 ] ];
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
                    "helloWorld",
                    FixedType("List", [
                        FixedType("List", [ FixedType("number", [ ]) ]),
                    ]),
                    ListValue([
                        ListValue([ Value("1"), Value("2"), Value("3") ]),
                        ListValue([ Value("3"), Value("2"), Value("1") ]),
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
                    "helloWorld",
                    FixedType("List", [
                        FixedType("List", [ FixedType("number", [ ]) ]),
                    ]),
                    ListValue([
                        ListValue([ Value("1"), Value("2"), Value("3") ]),
                        ListValue([ Value("3"), Value("2"), Value("1") ]),
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
