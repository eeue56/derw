import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    Addition,
    AnonFunctionArg,
    BlockKinds,
    Const,
    FixedType,
    FormatStringValue,
    Function,
    FunctionArg,
    IfStatement,
    Import,
    Lambda,
    Module,
    StringValue,
    Tag,
    Type,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

import { intoBlocks, blockKind } from "../blocks";
import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";

const oneLine = `import path`.trim();

const multiLine = `
import path
`.trim();

const expectedOutput = `
import path from "path";
`.trim();

const expectedOutputJS = `
import path from "path";
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ImportBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ImportBlock", 0, multiLine.split("\n")),
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
        Module("main", [ Import([ "path" ]) ], [ ])
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module("main", [ Import([ "path" ]) ], [ ])
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
