import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
unify: List (Result a b) -> Result (List a) (List b) -> Result (List a) (List b)
unify xs value = value
`.trim();

const multiLine = `
unify: List (Result a b) -> Result (List a) (List b) -> Result (List a) (List b)
unify xs value =
    value
`.trim();

const expectedOutput = `
function unify<a, b>(xs: Result<a, b>[], value: Result<a[], b[]>): Result<a[], b[]> {
    return value;
}
`.trim();

const expectedOutputJS = `
function unify(xs, value) {
    return value;
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
                    "unify",
                    FixedType("Result", [
                        FixedType("List", [ GenericType("a") ]),
                        FixedType("List", [ GenericType("b") ]),
                    ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [
                                FixedType("Result", [
                                    GenericType("a"),
                                    GenericType("b"),
                                ]),
                            ])
                        ),
                        FunctionArg(
                            "value",
                            FixedType("Result", [
                                FixedType("List", [ GenericType("a") ]),
                                FixedType("List", [ GenericType("b") ]),
                            ])
                        ),
                    ],
                    [ ],
                    Value("value")
                ),
            ],
            [
                "Error on lines 0 - 2\n" +
                    "Type Result (List (a) List (b)) did not exist in the namespace\n" +
                    "Type Result (List (a) List (b)) did not exist in the namespace:\n" +
                    "```\n" +
                    "unify: List (Result a b) -> Result (List a) (List b) -> Result (List a) (List b)\n" +
                    "unify xs value = value\n" +
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
                Function(
                    "unify",
                    FixedType("Result", [
                        FixedType("List", [ GenericType("a") ]),
                        FixedType("List", [ GenericType("b") ]),
                    ]),
                    [
                        FunctionArg(
                            "xs",
                            FixedType("List", [
                                FixedType("Result", [
                                    GenericType("a"),
                                    GenericType("b"),
                                ]),
                            ])
                        ),
                        FunctionArg(
                            "value",
                            FixedType("Result", [
                                FixedType("List", [ GenericType("a") ]),
                                FixedType("List", [ GenericType("b") ]),
                            ])
                        ),
                    ],
                    [ ],
                    Value("value")
                ),
            ],
            [
                "Error on lines 0 - 3\n" +
                    "Type Result (List (a) List (b)) did not exist in the namespace\n" +
                    "Type Result (List (a) List (b)) did not exist in the namespace:\n" +
                    "```\n" +
                    "unify: List (Result a b) -> Result (List a) (List b) -> Result (List a) (List b)\n" +
                    "unify xs value =\n" +
                    "    value\n" +
                    "```",
            ]
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
