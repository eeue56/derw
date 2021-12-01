import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateTypescript } from "../generator";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import {
    Const,
    Equality,
    FixedType,
    GreaterThan,
    GreaterThanOrEqual,
    InEquality,
    LessThan,
    LessThanOrEqual,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isEqual: boolean
isEqual = 1 == 2

isNotEqual: boolean
isNotEqual = 1 != 2

isLessThan: boolean
isLessThan = 1 < 2

isLessThanOrEqual: boolean
isLessThanOrEqual = 1 <= 2

isGreaterThan: boolean
isGreaterThan = 1 > 2

isGreaterThanOrEqual: boolean
isGreaterThanOrEqual = 1 >= 2
`.trim();

const multiLine = `
isEqual: boolean
isEqual = 
    1 == 2

isNotEqual: boolean
isNotEqual = 
    1 != 2

isLessThan: boolean
isLessThan = 
    1 < 2

isLessThanOrEqual: boolean
isLessThanOrEqual = 
    1 <= 2

isGreaterThan: boolean
isGreaterThan = 
    1 > 2

isGreaterThanOrEqual: boolean
isGreaterThanOrEqual = 
    1 >= 2
`.trim();

const expectedOutput = `
const isEqual: boolean = 1 === 2;

const isNotEqual: boolean = 1 !== 2;

const isLessThan: boolean = 1 < 2;

const isLessThanOrEqual: boolean = 1 <= 2;

const isGreaterThan: boolean = 1 > 2;

const isGreaterThanOrEqual: boolean = 1 >= 2;
`.trim();

const expectedOutputJS = `
const isEqual = 1 === 2;

const isNotEqual = 1 !== 2;

const isLessThan = 1 < 2;

const isLessThanOrEqual = 1 <= 2;

const isGreaterThan = 1 > 2;

const isGreaterThanOrEqual = 1 >= 2;
`.trim();

export function testIntoBlocks() {
    const lines = oneLine.split("\n");

    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, [ lines[0], lines[1] ]),
        UnparsedBlock("ConstBlock", 3, [ lines[3], lines[4] ]),
        UnparsedBlock("ConstBlock", 6, [ lines[6], lines[7] ]),
        UnparsedBlock("ConstBlock", 9, [ lines[9], lines[10] ]),
        UnparsedBlock("ConstBlock", 12, [ lines[12], lines[13] ]),
        UnparsedBlock("ConstBlock", 15, [ lines[15], lines[16] ]),
    ]);
}

export function testIntoBlocksMultiLine() {
    const lines = multiLine.split("\n");

    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, lines.slice(0, 3)),
        UnparsedBlock("ConstBlock", 4, lines.slice(4, 7)),
        UnparsedBlock("ConstBlock", 8, lines.slice(8, 11)),
        UnparsedBlock("ConstBlock", 12, lines.slice(12, 15)),
        UnparsedBlock("ConstBlock", 16, lines.slice(16, 19)),
        UnparsedBlock("ConstBlock", 20, lines.slice(20, 23)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Const"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "isEqual",
                    FixedType("boolean", [ ]),
                    Equality(Value("1"), Value("2"))
                ),

                Const(
                    "isNotEqual",
                    FixedType("boolean", [ ]),
                    InEquality(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThan",
                    FixedType("boolean", [ ]),
                    LessThan(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThanOrEqual",
                    FixedType("boolean", [ ]),
                    LessThanOrEqual(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThan",
                    FixedType("boolean", [ ]),
                    GreaterThan(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThanOrEqual",
                    FixedType("boolean", [ ]),
                    GreaterThanOrEqual(Value("1"), Value("2"))
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
                    "isEqual",
                    FixedType("boolean", [ ]),
                    Equality(Value("1"), Value("2"))
                ),

                Const(
                    "isNotEqual",
                    FixedType("boolean", [ ]),
                    InEquality(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThan",
                    FixedType("boolean", [ ]),
                    LessThan(Value("1"), Value("2"))
                ),

                Const(
                    "isLessThanOrEqual",
                    FixedType("boolean", [ ]),
                    LessThanOrEqual(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThan",
                    FixedType("boolean", [ ]),
                    GreaterThan(Value("1"), Value("2"))
                ),

                Const(
                    "isGreaterThanOrEqual",
                    FixedType("boolean", [ ]),
                    GreaterThanOrEqual(Value("1"), Value("2"))
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
