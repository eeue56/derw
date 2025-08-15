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
    Constructor,
    Field,
    FixedType,
    GenericType,
    Lambda,
    Module,
    ObjectLiteral,
    UnparsedBlock,
} from "../types";

const oneLine = `
filterMap: Maybe any
filterMap = { value: (\\answer -> Finish)}
`.trim();

const multiLine = `
filterMap: Maybe any
filterMap =
    { value: (\\answer -> Finish) }
`.trim();

const expectedOutput = `
const filterMap: Maybe<any> = { value: function(answer: any) {
    return Finish({ });
} };
`.trim();

const expectedOutputJS = `
const filterMap = { value: function(answer) {
    return Finish({ });
} };
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
                    "filterMap",
                    FixedType("Maybe", [GenericType("any")]),
                    [],
                    ObjectLiteral(null, [
                        Field(
                            "value",
                            Lambda(
                                ["answer"],
                                Constructor("Finish", ObjectLiteral(null, []))
                            )
                        ),
                    ])
                ),
            ],
            [
                "Error on lines 0 - 2\n" +
                    "Type Maybe (any) did not exist in the namespace:\n" +
                    "```\n" +
                    "filterMap: Maybe any\n" +
                    "filterMap = { value: (\\answer -> Finish)}\n" +
                    "```",
            ]
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
                    "filterMap",
                    FixedType("Maybe", [GenericType("any")]),
                    [],
                    ObjectLiteral(null, [
                        Field(
                            "value",
                            Lambda(
                                ["answer"],
                                Constructor("Finish", ObjectLiteral(null, []))
                            )
                        ),
                    ])
                ),
            ],
            [
                "Error on lines 0 - 3\n" +
                    "Type Maybe (any) did not exist in the namespace:\n" +
                    "```\n" +
                    "filterMap: Maybe any\n" +
                    "filterMap =\n" +
                    "    { value: (\\answer -> Finish) }\n" +
                    "```",
            ]
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
