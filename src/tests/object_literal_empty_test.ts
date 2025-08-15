import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    BlockKinds,
    Const,
    FixedType,
    Module,
    ObjectLiteral,
    TypeAlias,
    UnparsedBlock,
} from "../types";

const oneLine = `
type alias Person = { }

person: Person
person = {}
`.trim();

const multiLine = `
type alias Person = {
}

person: Person
person =
    { }
`.trim();

const expectedOutput = `
type Person = {

};

function Person(args: { }): Person {
    return {
        ...args,
    };
}

const person: Person = { };
`.trim();

const expectedOutputJS = `
function Person(args) {
    return {
        ...args,
    };
}

const person = { };
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("ConstBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n").slice(0, 2)),
        UnparsedBlock("ConstBlock", 3, multiLine.split("\n").slice(3)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine),
        Ok<string, BlockKinds>("TypeAlias")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("TypeAlias")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                TypeAlias(FixedType("Person", []), []),
                Const(
                    "person",
                    FixedType("Person", []),
                    [],
                    ObjectLiteral(null, [])
                ),
            ],
            []
        )
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                TypeAlias(FixedType("Person", []), []),
                Const(
                    "person",
                    FixedType("Person", []),
                    [],
                    ObjectLiteral(null, [])
                ),
            ],
            []
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateTypescript(parsed), expectedOutput);
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
