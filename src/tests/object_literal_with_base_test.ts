import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../derw_generator";
import { generateElm } from "../elm_generator";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import { generateTypescript } from "../ts_generator";
import {
    BlockKinds,
    Const,
    Field,
    FixedType,
    ListValue,
    Module,
    ObjectLiteral,
    Property,
    StringValue,
    TypeAlias,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
type alias Person = {
    name: string,
    age: number,
    people: List string
}

person: Person
person = { ...noah, name: "hello", age: 28, people: [] }
`.trim();

const multiLine = `
type alias Person = {
    name: string,
    age: number,
    people: List string
}

person: Person
person = {
    ...noah,
    name: "hello",
    age: 28,
    people: []
}
`.trim();

const expectedOutput = `
type Person = {
    name: string;
    age: number;
    people: string[];
}

function Person(args: { name: string, age: number, people: string[] }): Person {
    return {
        ...args,
    };
}

const person: Person = {
    ...noah,
    name: "hello",
    age: 28,
    people: [ ]
};
`.trim();

const expectedOutputJS = `
function Person(args) {
    return {
        ...args,
    };
}

const person = {
    ...noah,
    name: "hello",
    age: 28,
    people: [ ]
};
`.trim();

const expectedOutputDerw = `
type alias Person = {
    name: string,
    age: number,
    people: List string
}

person: Person
person =
    {
        ...noah,
        name: "hello",
        age: 28,
        people: [ ]
    }
`.trim();

const expectedOutputElm = `
module Main exposing (..)

type alias Person = {
    name: String,
    age: Float,
    people: List String
}

person: Person
person =
    {
        noah |
        name = "hello",
        age = 28,
        people = [ ]
    }
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n").slice(0, 5)),
        UnparsedBlock("ConstBlock", 6, oneLine.split("\n").slice(6)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n").slice(0, 5)),
        UnparsedBlock("ConstBlock", 6, multiLine.split("\n").slice(6)),
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
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                    Property(
                        "people",
                        FixedType("List", [ FixedType("string", [ ]) ])
                    ),
                ]),
                Const(
                    "person",
                    FixedType("Person", [ ]),
                    ObjectLiteral(Value("...noah"), [
                        Field("name", StringValue("hello")),
                        Field("age", Value("28")),
                        Field("people", ListValue([ ])),
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
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                    Property(
                        "people",
                        FixedType("List", [ FixedType("string", [ ]) ])
                    ),
                ]),
                Const(
                    "person",
                    FixedType("Person", [ ]),
                    ObjectLiteral(Value("...noah"), [
                        Field("name", StringValue("hello")),
                        Field("age", Value("28")),
                        Field("people", ListValue([ ])),
                    ])
                ),
            ],
            [ ]
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

export function testGenerateDerw() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateDerw(parsed), expectedOutputDerw);
}

export function testGenerateDerwMultiLine() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(generateDerw(parsed), expectedOutputDerw);
}

export function testGenerateElm() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateElm(parsed), expectedOutputElm);
}

export function testGenerateElmMultiLine() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(generateElm(parsed), expectedOutputElm);
}
