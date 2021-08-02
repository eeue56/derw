import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    IfStatement,
    Module,
    Tag,
    Type,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

import { intoBlocks, blockKind } from "../blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";

const oneLine = `
isTrue: Maybe a -> Maybe b
isTrue value = if value then value else value
`.trim();

const multiLine = `
isTrue: Maybe a -> Maybe b
isTrue value =
    if value then
        value
    else
        value
`.trim();

const expectedOutput = `
function isTrue<a, b>(value: Maybe<a>): Maybe<b> {
    if (value) {
        return value;
    } else {
        return value;
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    FixedType("Maybe", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    IfStatement(Value("value"), Value("value"), Value("value"))
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
                Function(
                    "isTrue",
                    FixedType("Maybe", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "value",
                            FixedType("Maybe", [ GenericType("a") ])
                        ),
                    ],
                    IfStatement(Value("value"), Value("value"), Value("value"))
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
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
