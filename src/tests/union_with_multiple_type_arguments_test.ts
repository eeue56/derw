import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    FixedType,
    GenericType,
    Module,
    Tag,
    TagArg,
    Type,
    UnionType,
    UnparsedBlock,
} from "../types";
import { intoBlocks, blockKind } from "../blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";

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

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeBlock", 0, multiLine.split("\n")),
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
