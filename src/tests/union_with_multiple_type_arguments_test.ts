import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import { generateTypescript } from "../ts_generator";
import {
    FixedType,
    GenericType,
    Module,
    Tag,
    TagArg,
    UnionType,
    UnparsedBlock,
} from "../types";

const oneLine = `
type Either a b = Left { value: a } | Right { value: b }
`.trim();

const multiLine = `
type Either a b
    = Left { value: a }
    | Right { value: b }
`.trim();

const expectedOutput = `
type Left<a> = {
    kind: "Left";
    value: a;
};

function Left<a>(args: { value: a }): Left<a> {
    return {
        kind: "Left",
        ...args,
    };
}

type Right<b> = {
    kind: "Right";
    value: b;
};

function Right<b>(args: { value: b }): Right<b> {
    return {
        kind: "Right",
        ...args,
    };
}

type Either<a, b> = Left<a> | Right<b>;
`.trim();

const expectedOutputJS = `
function Left(args) {
    return {
        kind: "Left",
        ...args,
    };
}

function Right(args) {
    return {
        kind: "Right",
        ...args,
    };
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionTypeBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionTypeBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("UnionType"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("UnionType"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionType(
                    FixedType("Either", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("Left", [ TagArg("value", GenericType("a")) ]),
                        Tag("Right", [ TagArg("value", GenericType("b")) ]),
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
                UnionType(
                    FixedType("Either", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("Left", [ TagArg("value", GenericType("a")) ]),
                        Tag("Right", [ TagArg("value", GenericType("b")) ]),
                    ]
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
