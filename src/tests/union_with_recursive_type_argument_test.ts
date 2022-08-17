import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
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
type HamtNode a = Subtree { tree: Tree a } | Leaf { children: List a }

type Tree a = TreeNode { elements: List (HamtNode a) }
`.trim();

const multiLine = `
type HamtNode a =
    Subtree { tree: Tree a }
    | Leaf { children: List a }

type Tree a =
    TreeNode { elements: List (HamtNode a) }
`.trim();

const expectedOutput = `
type Subtree<a> = {
    kind: "Subtree";
    tree: Tree<a>;
};

function Subtree<a>(args: { tree: Tree<a> }): Subtree<a> {
    return {
        kind: "Subtree",
        ...args,
    };
}

type Leaf<a> = {
    kind: "Leaf";
    children: a[];
};

function Leaf<a>(args: { children: a[] }): Leaf<a> {
    return {
        kind: "Leaf",
        ...args,
    };
}

type HamtNode<a> = Subtree<a> | Leaf<a>;

type TreeNode<a> = {
    kind: "TreeNode";
    elements: HamtNode<a>[];
};

function TreeNode<a>(args: { elements: HamtNode<a>[] }): TreeNode<a> {
    return {
        kind: "TreeNode",
        ...args,
    };
}

type Tree<a> = TreeNode<a>;
`.trim();

const expectedOutputJS = `
function Subtree(args) {
    return {
        kind: "Subtree",
        ...args,
    };
}

function Leaf(args) {
    return {
        kind: "Leaf",
        ...args,
    };
}

function TreeNode(args) {
    return {
        kind: "TreeNode",
        ...args,
    };
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionTypeBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("UnionTypeBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionTypeBlock", 0, multiLine.split("\n").slice(0, 3)),
        UnparsedBlock("UnionTypeBlock", 4, multiLine.split("\n").slice(4)),
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
                UnionType(FixedType("HamtNode", [ GenericType("a") ]), [
                    Tag("Subtree", [
                        TagArg("tree", FixedType("Tree", [ GenericType("a") ])),
                    ]),
                    Tag("Leaf", [
                        TagArg(
                            "children",
                            FixedType("List", [ GenericType("a") ])
                        ),
                    ]),
                ]),
                UnionType(FixedType("Tree", [ GenericType("a") ]), [
                    Tag("TreeNode", [
                        TagArg(
                            "elements",
                            FixedType("List", [
                                FixedType("HamtNode", [ GenericType("a") ]),
                            ])
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
                UnionType(FixedType("HamtNode", [ GenericType("a") ]), [
                    Tag("Subtree", [
                        TagArg("tree", FixedType("Tree", [ GenericType("a") ])),
                    ]),
                    Tag("Leaf", [
                        TagArg(
                            "children",
                            FixedType("List", [ GenericType("a") ])
                        ),
                    ]),
                ]),
                UnionType(FixedType("Tree", [ GenericType("a") ]), [
                    Tag("TreeNode", [
                        TagArg(
                            "elements",
                            FixedType("List", [
                                FixedType("HamtNode", [ GenericType("a") ]),
                            ])
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

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
