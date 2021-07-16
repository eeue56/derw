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

export function testIntoBlocksComplexUnion() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ oneLine ]);
}

export function testIntoBlocksMultiLineUnion() {
    assert.deepStrictEqual(intoBlocks(multiLine), [ multiLine ]);
}

export function testBlockKindComplexUnion() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("UnionType"));
}

export function testBlockKindMultiLineUnion() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("UnionType"));
}

export function testParseComplexUnion() {
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

export function testParseMultiLineUnion() {
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

export function testGenerateComplexUnion() {
    const parsed = parse(oneLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLineUnion() {
    const parsed = parse(multiLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
}
