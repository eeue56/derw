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
    Field,
    FixedType,
    FunctionCall,
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
person = fn {name: "hello", age: 28, people: []} {name: "world", age: 29, people: []}
`.trim();

const multiLine = `
type alias Person = {
    name: string,
    age: number,
    people: List string
}

person: Person
person =
    fn {
        name: "hello",
        age: 28,
        people: [ ]
    } {
        name: "world",
        age: 29,
        people: [ ]
    }
`.trim();

const expectedOutput = `
type Person = {
    name: string;
    age: number;
    people: string[];
};

function Person(args: { name: string; age: number; people: string[]; }): Person {
    return {
        ...args,
    };
}

const person: Person = fn({
    name: "hello",
    age: 28,
    people: [],
}, {
    name: "world",
    age: 29,
    people: [],
});
`.trim();

const expectedOutputJS = `
function Person(args) {
    return {
        ...args,
    };
}

const person = fn({
    name: "hello",
    age: 28,
    people: [],
}, {
    name: "world",
    age: 29,
    people: [],
});
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
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                    Property(
                        "people",
                        FixedType("List", [FixedType("string", [])])
                    ),
                ]),
                Const(
                    "person",
                    FixedType("Person", []),
                    [],
                    FunctionCall("fn", [
                        ObjectLiteral(null, [
                            Field("name", StringValue("hello")),
                            Field("age", Value("28")),
                            Field("people", ListValue([])),
                        ]),
                        ObjectLiteral(null, [
                            Field("name", StringValue("world")),
                            Field("age", Value("29")),
                            Field("people", ListValue([])),
                        ]),
                    ])
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
                TypeAlias(FixedType("Person", []), [
                    Property("name", FixedType("string", [])),
                    Property("age", FixedType("number", [])),
                    Property(
                        "people",
                        FixedType("List", [FixedType("string", [])])
                    ),
                ]),
                Const(
                    "person",
                    FixedType("Person", []),
                    [],
                    FunctionCall("fn", [
                        ObjectLiteral(null, [
                            Field("name", StringValue("hello")),
                            Field("age", Value("28")),
                            Field("people", ListValue([])),
                        ]),
                        ObjectLiteral(null, [
                            Field("name", StringValue("world")),
                            Field("age", Value("29")),
                            Field("people", ListValue([])),
                        ]),
                    ])
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
