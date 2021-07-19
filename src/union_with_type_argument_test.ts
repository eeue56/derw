import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import {
    FixedType,
    GenericType,
    Module,
    Tag,
    TagArg,
    Type,
    UnionType,
} from "./types";
import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

const oneLine = `
type List a = Leaf { value: a } | Node { value: a, next: List a }
`.trim();

const multiLine = `
type List a
    = Leaf { value: a }
    | Node { value: a, next: List a }
`.trim();

const expectedOutput = `
type Leaf<a> = {
    kind: "Leaf";
    value: a;
}

function Leaf<a>(value: a): Leaf<a> {
    return {
        kind: "Leaf",
        value
    }
}

type Node<a> = {
    kind: "Node";
    value: a;
    next: List<a>;
}

function Node<a>(value: a, next: List<a>): Node<a> {
    return {
        kind: "Node",
        value,
        next
    }
}

type List<a> = Leaf<a> | Node<a>;
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ oneLine ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [ multiLine ]);
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
                UnionType(FixedType("List", [ GenericType("a") ]), [
                    Tag("Leaf", [ TagArg("value", GenericType("a")) ]),
                    Tag("Node", [
                        TagArg("value", GenericType("a")),
                        TagArg("next", FixedType("List", [ GenericType("a") ])),
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
                UnionType(FixedType("List", [ GenericType("a") ]), [
                    Tag("Leaf", [ TagArg("value", GenericType("a")) ]),
                    Tag("Node", [
                        TagArg("value", GenericType("a")),
                        TagArg("next", FixedType("List", [ GenericType("a") ])),
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
