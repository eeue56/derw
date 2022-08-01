import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    BlockKinds,
    Const,
    Field,
    FixedType,
    GenericType,
    Module,
    ObjectLiteral,
    Property,
    TypeAlias,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
type alias Person = {
    name: any,
    age: number
}

person: Person
person = { name: { }, age: 28 }
`.trim();

const multiLine = `
type alias Person = {
    name: any,
    age: number
}

person: Person
person = {
    name: { },
    age: 28
}
`.trim();

const expectedOutput = `
type Person = {
    name: any;
    age: number;
}

function Person(args: { name: any, age: number }): Person {
    return {
        ...args,
    };
}

const person: Person = {
    name: { },
    age: 28
};
`.trim();

const expectedOutputJS = `
function Person(args) {
    return {
        ...args,
    };
}

const person = {
    name: { },
    age: 28
};
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n").slice(0, 4)),
        UnparsedBlock("ConstBlock", 5, oneLine.split("\n").slice(5)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n").slice(0, 4)),
        UnparsedBlock("ConstBlock", 5, multiLine.split("\n").slice(5)),
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
                    Property("name", GenericType("any")),
                    Property("age", FixedType("number", [ ])),
                ]),
                Const(
                    "person",
                    FixedType("Person", [ ]),
                    [ ],
                    ObjectLiteral(null, [
                        Field("name", ObjectLiteral(null, [ ])),
                        Field("age", Value("28")),
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
                    Property("name", GenericType("any")),
                    Property("age", FixedType("number", [ ])),
                ]),
                Const(
                    "person",
                    FixedType("Person", [ ]),
                    [ ],
                    ObjectLiteral(null, [
                        Field("name", ObjectLiteral(null, [ ])),
                        Field("age", Value("28")),
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
