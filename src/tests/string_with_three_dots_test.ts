import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Branch,
    CaseStatement,
    Const,
    Constructor,
    Destructure,
    FixedType,
    FormatStringValue,
    FunctionCall,
    ListValue,
    Module,
    ObjectLiteral,
    UnparsedBlock,
} from "../types";

const oneLine = `
example: string
example =
    case Nothing of
        Nothing ->
            div [] [ ] [ text \`...\` ]
        Just { value } ->
            div [] [] []
`.trim();

const multiLine = `
example: string
example =
    case Nothing of
        Nothing ->
            div [] [ ] [ text \`...\` ]
        Just { value } ->
            div [] [] []
`.trim();

const expectedOutput = `
const example: string = (function (): any {
    const _res589930068 = Nothing({ });
    switch (_res589930068.kind) {
        case "Nothing": {
            return div([ ], [ ], [ text(\`...\`) ]);
        }
        case "Just": {
            const { value } = _res589930068;
            return div([ ], [ ], [ ]);
        }
    }
})();
`.trim();

const expectedOutputJS = `
const example = (function () {
    const _res589930068 = Nothing({ });
    switch (_res589930068.kind) {
        case "Nothing": {
            return div([ ], [ ], [ text(\`...\`) ]);
        }
        case "Just": {
            const { value } = _res589930068;
            return div([ ], [ ], [ ]);
        }
    }
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
                    "example",
                    FixedType("string", [ ]),
                    [ ],
                    CaseStatement(
                        Constructor("Nothing", ObjectLiteral(null, [ ])),
                        [
                            Branch(
                                Destructure("Nothing", ""),
                                FunctionCall("div", [
                                    ListValue([ ]),
                                    ListValue([ ]),
                                    ListValue([
                                        FunctionCall("text", [
                                            FormatStringValue("..."),
                                        ]),
                                    ]),
                                ]),
                                [ ]
                            ),
                            Branch(
                                Destructure("Just", "{ value }"),
                                FunctionCall("div", [
                                    ListValue([ ]),
                                    ListValue([ ]),
                                    ListValue([ ]),
                                ]),
                                [ ]
                            ),
                        ]
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
                    "example",
                    FixedType("string", [ ]),
                    [ ],
                    CaseStatement(
                        Constructor("Nothing", ObjectLiteral(null, [ ])),
                        [
                            Branch(
                                Destructure("Nothing", ""),
                                FunctionCall("div", [
                                    ListValue([ ]),
                                    ListValue([ ]),
                                    ListValue([
                                        FunctionCall("text", [
                                            FormatStringValue("..."),
                                        ]),
                                    ]),
                                ]),
                                [ ]
                            ),
                            Branch(
                                Destructure("Just", "{ value }"),
                                FunctionCall("div", [
                                    ListValue([ ]),
                                    ListValue([ ]),
                                    ListValue([ ]),
                                ]),
                                [ ]
                            ),
                        ]
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
