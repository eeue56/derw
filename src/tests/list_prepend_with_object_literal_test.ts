import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Const,
    Constructor,
    Field,
    FixedType,
    ListPrepend,
    Module,
    ModuleReference,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
helloWorld: Maybe (List number)
helloWorld = Just { value: 123 :: something.value }
`.trim();

const multiLine = `
helloWorld: Maybe (List number)
helloWorld =
    Just { value: 123 :: something.value }
`.trim();

const expectedOutput = `
const helloWorld: Maybe<number[]> = Just({ value: [ 123, ...something.value ] });
`.trim();

const expectedOutputJS = `
const helloWorld = Just({ value: [ 123, ...something.value ] });
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
                    "helloWorld",
                    FixedType("Maybe", [
                        FixedType("List", [ FixedType("number", [ ]) ]),
                    ]),
                    [ ],
                    Constructor(
                        "Just",
                        ObjectLiteral(null, [
                            Field(
                                "value",
                                ListPrepend(
                                    Value("123"),
                                    ModuleReference(
                                        [ "something" ],
                                        Value("value")
                                    )
                                )
                            ),
                        ])
                    )
                ),
            ],
            [
                "Error on lines 0 - 2\n" +
                    "Type Maybe (List (number)) did not exist in the namespace:\n" +
                    "```\n" +
                    "helloWorld: Maybe (List number)\n" +
                    "helloWorld = Just { value: 123 :: something.value }\n" +
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
                    "helloWorld",
                    FixedType("Maybe", [
                        FixedType("List", [ FixedType("number", [ ]) ]),
                    ]),
                    [ ],
                    Constructor(
                        "Just",
                        ObjectLiteral(null, [
                            Field(
                                "value",
                                ListPrepend(
                                    Value("123"),
                                    ModuleReference(
                                        [ "something" ],
                                        Value("value")
                                    )
                                )
                            ),
                        ])
                    )
                ),
            ],
            [
                "Error on lines 0 - 3\n" +
                    "Type Maybe (List (number)) did not exist in the namespace:\n" +
                    "```\n" +
                    "helloWorld: Maybe (List number)\n" +
                    "helloWorld =\n" +
                    "    Just { value: 123 :: something.value }\n" +
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
