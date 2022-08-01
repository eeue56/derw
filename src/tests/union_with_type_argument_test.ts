import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
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
