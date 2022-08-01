import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/derw";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Const,
    Equality,
    FixedType,
    IfStatement,
    Module,
    MultilineComment,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
{-
something with name
eman htiw gnihtemos
-}
name: string
name =
    if 1 == 1 then
        "Noah"
    else
        "James"
`.trim();

const multiLine = `
{-
something with name
eman htiw gnihtemos
-}
name: string
name =
    if 1 == 1 then
        "Noah"
    else
        "James"
`.trim();

const expectedOutput = `
const name: string = 1 === 1 ? "Noah" : "James";
`.trim();

const expectedOutputJS = `
const name = 1 === 1 ? "Noah" : "James";
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock(
            "MultilineCommentBlock",
            0,
            oneLine.split("\n").slice(0, 4)
        ),
        UnparsedBlock("ConstBlock", 4, oneLine.split("\n").slice(4)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock(
            "MultilineCommentBlock",
            0,
            oneLine.split("\n").slice(0, 4)
        ),
        UnparsedBlock("ConstBlock", 4, oneLine.split("\n").slice(4)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("MultilineComment"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("MultilineComment"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                MultilineComment("something with name\neman htiw gnihtemos"),
                Const(
                    "name",
                    FixedType("string", [ ]),
                    [ ],
                    IfStatement(
                        Equality(Value("1"), Value("1")),
                        StringValue("Noah"),
                        [ ],
                        StringValue("James"),
                        [ ]
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
                MultilineComment("something with name\neman htiw gnihtemos"),
                Const(
                    "name",
                    FixedType("string", [ ]),
                    [ ],
                    IfStatement(
                        Equality(Value("1"), Value("1")),
                        StringValue("Noah"),
                        [ ],
                        StringValue("James"),
                        [ ]
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

export function testGenerateOneLineDerw() {
    const parsed = parse(oneLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, oneLine);
}
