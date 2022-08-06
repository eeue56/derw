import * as assert from "@eeue56/ts-assert";
import { Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Const,
    FixedType,
    FunctionCall,
    Import,
    ImportModule,
    LeftPipe,
    ListValue,
    Module,
    ModuleReference,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
import List exposing (List)

helloWorld: List number
helloWorld = [ 1, 2, 3] |> List.foldl add
`.trim();

const multiLine = `
import List exposing ( List )

helloWorld: List number
helloWorld =
    [
        1,
        2,
        3
    ]
        |> List.foldl add
`.trim();

const expectedOutput = `
import { List } from "List";

const helloWorld: number[] = List.foldl(add, [ 1, 2, 3 ]);
`.trim();

const expectedOutputJS = `
import { List } from "List";

const helloWorld = List.foldl(add, [ 1, 2, 3 ]);
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ImportBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("ConstBlock", 2, oneLine.split("\n").slice(2)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ImportBlock", 0, multiLine.split("\n").slice(0, 1)),
        UnparsedBlock("ConstBlock", 2, multiLine.split("\n").slice(2)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Import"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Import"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
                Const(
                    "helloWorld",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    [ ],
                    LeftPipe(
                        ListValue([ Value("1"), Value("2"), Value("3") ]),
                        ModuleReference(
                            [ "List" ],
                            FunctionCall("foldl", [ Value("add") ])
                        )
                    )
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
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
                Const(
                    "helloWorld",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    [ ],
                    LeftPipe(
                        ListValue([ Value("1"), Value("2"), Value("3") ]),
                        ModuleReference(
                            [ "List" ],
                            FunctionCall("foldl", [ Value("add") ])
                        )
                    )
                ),
            ],
            [ ]
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
