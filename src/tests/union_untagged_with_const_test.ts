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
    FixedType,
    GenericType,
    Module,
    StringValue,
    UnionUntaggedType,
    UnparsedBlock,
} from "../types";

const functionPart = `
asIs: Result
asIs =
    "Err"
`.trim();

const rawOneLine = `
type Result = "Err" | "Ok"
`.trim();

const oneLine = `
${rawOneLine}

${functionPart}
`;

const rawMultiLine = `
type Result =
    "Err"
    | "Ok"
`.trim();

const multilineFunctionPart = `
asIs: Result
asIs =
    "Err"
`.trim();

const multiLine = `
${rawMultiLine}

${multilineFunctionPart}
`.trim();

const expectedOutput = `
type Result = "Err" | "Ok";

const asIs: Result = "Err";
`.trim();

const expectedOutputJS = `
const asIs = "Err";
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionUntaggedTypeBlock", 1, rawOneLine.split("\n")),
        UnparsedBlock("ConstBlock", 3, functionPart.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionUntaggedTypeBlock", 0, rawMultiLine.split("\n")),
        UnparsedBlock("ConstBlock", 4, multilineFunctionPart.split("\n")),
    ]);
}

export function testBlockKind() {
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("UnionUntaggedType"), Ok("Const") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("UnionUntaggedType"), Ok("Const") ]
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionUntaggedType(FixedType("Result", [ ]), [
                    StringValue("Err"),
                    StringValue("Ok"),
                ]),
                Const(
                    "asIs",
                    FixedType("Result", [ ]),
                    [ ],
                    StringValue("Err")
                ),
            ],
            [ ]
        )
    );
}

export function testParseMultiLine() {
    const returnType = FixedType("Result", [
        GenericType("a"),
        GenericType("b"),
    ]);

    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                UnionUntaggedType(FixedType("Result", [ ]), [
                    StringValue("Err"),
                    StringValue("Ok"),
                ]),
                Const(
                    "asIs",
                    FixedType("Result", [ ]),
                    [ ],
                    StringValue("Err")
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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
