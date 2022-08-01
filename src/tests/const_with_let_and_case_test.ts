import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Branch,
    CaseStatement,
    Const,
    Constructor,
    Destructure,
    FixedType,
    Module,
    ObjectLiteral,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
name: string
name =
    let
        rootName: string
        rootName =
            case Nothing of
                Just { value } -> value
                Nothing -> ""
    in
        rootName
`.trim();

const multiLine = `
name: string
name =
    let
        rootName: string
        rootName =
            case Nothing of
                Just { value } -> value
                Nothing -> ""
    in
        rootName
`.trim();

const expectedOutput = `
const name: string = (function(): string {
    const rootName: string = (function (): any {
        const _res589930068 = Nothing({ });
        switch (_res589930068.kind) {
            case "Just": {
                const { value } = _res589930068;
                return value;
            }
            case "Nothing": {
                return "";
            }
        }
    })();
    return rootName;
})();
`.trim();

const expectedOutputJS = `
const name = (function() {
    const rootName = (function () {
        const _res589930068 = Nothing({ });
        switch (_res589930068.kind) {
            case "Just": {
                const { value } = _res589930068;
                return value;
            }
            case "Nothing": {
                return "";
            }
        }
    })();
    return rootName;
})();
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
                    "name",
                    FixedType("string", [ ]),
                    [
                        Const(
                            "rootName",
                            FixedType("string", [ ]),
                            [ ],
                            CaseStatement(
                                Constructor(
                                    "Nothing",
                                    ObjectLiteral(null, [ ])
                                ),
                                [
                                    Branch(
                                        Destructure("Just", "{ value }"),
                                        Value("value"),
                                        [ ]
                                    ),

                                    Branch(
                                        Destructure("Nothing", ""),
                                        StringValue(""),
                                        [ ]
                                    ),
                                ]
                            )
                        ),
                    ],
                    Value("rootName")
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
                    "name",
                    FixedType("string", [ ]),
                    [
                        Const(
                            "rootName",
                            FixedType("string", [ ]),
                            [ ],
                            CaseStatement(
                                Constructor(
                                    "Nothing",
                                    ObjectLiteral(null, [ ])
                                ),
                                [
                                    Branch(
                                        Destructure("Just", "{ value }"),
                                        Value("value"),
                                        [ ]
                                    ),

                                    Branch(
                                        Destructure("Nothing", ""),
                                        StringValue(""),
                                        [ ]
                                    ),
                                ]
                            )
                        ),
                    ],
                    Value("rootName")
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
