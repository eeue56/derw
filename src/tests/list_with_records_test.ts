import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
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
type alias Person = { name: string, age: number }

helloWorld: List Person
helloWorld = [ { name: "Noah", age: 29 } ]
`.trim();

const multiLine = `
type alias Person = {
    name: string,
    age: number
}

helloWorld: List Person
helloWorld =
    [ {
        name: "Noah",
        age: 29
    } ]
`.trim();

const expectedOutput = `
type Person = {
    name: string;
    age: number;
};

function Person(args: { name: string; age: number; }): Person {
    return {
        ...args,
    };
}

const helloWorld: Person[] = [{
    name: "Noah",
    age: 29,
}];
`.trim();

const expectedOutputJS = `
function Person(args) {
    return {
        ...args,
    };
}

const helloWorld = [{
    name: "Noah",
    age: 29,
}];
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("ConstBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n").slice(0, 4)),
        UnparsedBlock("ConstBlock", 5, multiLine.split("\n").slice(5)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("TypeAlias"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("TypeAlias"));
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
                ]),
                Const(
                    "helloWorld",
                    FixedType("List", [FixedType("Person", [])]),
                    [],
                    ListValue([
                        ObjectLiteral(null, [
                            Field("name", StringValue("Noah")),
                            Field("age", Value("29")),
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
                ]),
                Const(
                    "helloWorld",
                    FixedType("List", [FixedType("Person", [])]),
                    [],
                    ListValue([
                        ObjectLiteral(null, [
                            Field("name", StringValue("Noah")),
                            Field("age", Value("29")),
                        ]),
                    ])
                ),
            ],
            []
        )
    );
}

export function testGenerate() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateOneLine() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
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
