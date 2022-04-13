import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/derw";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    BlockKinds,
    Const,
    Field,
    FixedType,
    FunctionCall,
    ListValue,
    Module,
    ModuleReference,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
sum: List number
sum = List.map .x [ { x: 1 }, { x: 2 }, { x: 3 } ]
`.trim();

const multiLine = `
sum: List number
sum =
    List.map .x [ { x: 1 }, { x: 2 }, { x: 3 } ]
`.trim();

const expectedOutput = `
const sum: number[] = List.map((arg0) => arg0.x, [ { x: 1 }, { x: 2 }, { x: 3 } ]);
`.trim();

const expectedOutputJS = `
const sum = List.map((arg0) => arg0.x, [ { x: 1 }, { x: 2 }, { x: 3 } ]);
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok<string, BlockKinds>("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("Const")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "sum",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    ModuleReference(
                        [ "List" ],
                        FunctionCall("map", [
                            ModuleReference([ ], Value("x")),
                            ListValue([
                                ObjectLiteral(null, [ Field("x", Value("1")) ]),
                                ObjectLiteral(null, [ Field("x", Value("2")) ]),
                                ObjectLiteral(null, [ Field("x", Value("3")) ]),
                            ]),
                        ])
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
                Const(
                    "sum",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    ModuleReference(
                        [ "List" ],
                        FunctionCall("map", [
                            ModuleReference([ ], Value("x")),
                            ListValue([
                                ObjectLiteral(null, [ Field("x", Value("1")) ]),
                                ObjectLiteral(null, [ Field("x", Value("2")) ]),
                                ObjectLiteral(null, [ Field("x", Value("3")) ]),
                            ]),
                        ])
                    )
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

export function testGenerateMultiLineDerw() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(
        generateDerw(parsed),
        `
sum: List number
sum =
    List.map .x [
        { x: 1 },
        { x: 2 },
        { x: 3 }
    ]`.trim()
    );
}
