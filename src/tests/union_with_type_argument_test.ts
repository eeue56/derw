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
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";
import { Diagnostic } from "typescript";
import { generateJavascript } from "../js_generator";

const oneLine = `
type CustomList a = Leaf { value: a } | Node { value: a, next: CustomList a }
`.trim();

const multiLine = `
type CustomList a
    = Leaf { value: a }
    | Node { value: a, next: CustomList a }
`.trim();

const expectedOutput = `
type Leaf<a> = {
    kind: "Leaf";
    value: a;
};

function Leaf<a>(args: { value: a }): Leaf<a> {
    return {
        kind: "Leaf",
        ...args,
    };
}

type Node<a> = {
    kind: "Node";
    value: a;
    next: CustomList<a>;
};

function Node<a>(args: { value: a, next: CustomList<a> }): Node<a> {
    return {
        kind: "Node",
        ...args,
    };
}

type CustomList<a> = Leaf<a> | Node<a>;
`.trim();

const expectedOutputJS = `
function Leaf(args) {
    return {
        kind: "Leaf",
        ...args,
    };
}

function Node(args) {
    return {
        kind: "Node",
        ...args,
    };
}
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
                UnionType(FixedType("CustomList", [ GenericType("a") ]), [
                    Tag("Leaf", [ TagArg("value", GenericType("a")) ]),
                    Tag("Node", [
                        TagArg("value", GenericType("a")),
                        TagArg(
                            "next",
                            FixedType("CustomList", [ GenericType("a") ])
                        ),
                    ]),
                ]),
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
                UnionType(FixedType("CustomList", [ GenericType("a") ]), [
                    Tag("Leaf", [ TagArg("value", GenericType("a")) ]),
                    Tag("Node", [
                        TagArg("value", GenericType("a")),
                        TagArg(
                            "next",
                            FixedType("CustomList", [ GenericType("a") ])
                        ),
                    ]),
                ]),
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
