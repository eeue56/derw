import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Branch,
    CaseStatement,
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    Module,
    StringValue,
    UnionUntaggedType,
    UnparsedBlock,
    Value,
} from "../types";

const functionPart = `
asIs: Result -> Result
asIs result =
    case result of
        "Err" -> "Err"
        "Ok" -> "Ok"
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
asIs: Result -> Result
asIs result =
    case result of
        "Err" ->
            "Err"

        "Ok" ->
            "Ok"
`.trim();

const multiLine = `
${rawMultiLine}

${multilineFunctionPart}
`.trim();

const expectedOutput = `
type Result = "Err" | "Ok";

function asIs(result: Result): Result {
    switch (result) {
        case "Err": {
            return "Err";
        }
        case "Ok": {
            return "Ok";
        }
    }
}
`.trim();

const expectedOutputJS = `
function asIs(result) {
    switch (result) {
        case "Err": {
            return "Err";
        }
        case "Ok": {
            return "Ok";
        }
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionUntaggedTypeBlock", 1, rawOneLine.split("\n")),
        UnparsedBlock("FunctionBlock", 3, functionPart.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionUntaggedTypeBlock", 0, rawMultiLine.split("\n")),
        UnparsedBlock("FunctionBlock", 4, multilineFunctionPart.split("\n")),
    ]);
}

export function testBlockKind() {
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("UnionUntaggedType"), Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("UnionUntaggedType"), Ok("Function") ]
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
                Function(
                    "asIs",
                    FixedType("Result", [ ]),
                    [ FunctionArg("result", FixedType("Result", [ ])) ],
                    [ ],
                    CaseStatement(Value("result"), [
                        Branch(StringValue("Err"), StringValue("Err"), [ ]),
                        Branch(StringValue("Ok"), StringValue("Ok"), [ ]),
                    ])
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
                Function(
                    "asIs",
                    FixedType("Result", [ ]),
                    [ FunctionArg("result", FixedType("Result", [ ])) ],
                    [ ],
                    CaseStatement(Value("result"), [
                        Branch(StringValue("Err"), StringValue("Err"), [ ]),
                        Branch(StringValue("Ok"), StringValue("Ok"), [ ]),
                    ])
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
