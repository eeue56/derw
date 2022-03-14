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
    Constructor,
    Destructure,
    Field,
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    Module,
    ObjectLiteral,
    Tag,
    TagArg,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

const functionPart = `
asIs: Result a b -> Result a b
asIs result =
    case result of
        Err { error } -> Err { error: error  }
        Ok { value } -> Ok { value: value }
`.trim();

const rawOneLine = `
type Result a b = Err { error: a } | Ok { value: b }
`.trim();

const oneLine = `
${rawOneLine}

${functionPart}
`;

const rawMultiLine = `
type Result a b
    = Err { error: a }
    | Ok { value: b }
`.trim();

const multilineFunctionPart = `
asIs: Result a b -> Result a b
asIs result =
    case result of
        Err { error } ->
            Err { error: error }
        Ok { value } ->
            Ok { value: value }
`.trim();

const multiLine = `
${rawMultiLine}

${multilineFunctionPart}
`.trim();

const expectedOutput = `
type Err<a> = {
    kind: "Err";
    error: a;
};

function Err<a>(args: { error: a }): Err<a> {
    return {
        kind: "Err",
        ...args,
    };
}

type Ok<b> = {
    kind: "Ok";
    value: b;
};

function Ok<b>(args: { value: b }): Ok<b> {
    return {
        kind: "Ok",
        ...args,
    };
}

type Result<a, b> = Err<a> | Ok<b>;

function asIs<a, b>(result: Result<a, b>): Result<a, b> {
    const _res934426595 = result;
    switch (_res934426595.kind) {
        case "Err": {
            const { error } = _res934426595;
            return Err({ error });
        }
        case "Ok": {
            const { value } = _res934426595;
            return Ok({ value });
        }
    }
}
`.trim();

const expectedOutputJS = `
function Err(args) {
    return {
        kind: "Err",
        ...args,
    };
}

function Ok(args) {
    return {
        kind: "Ok",
        ...args,
    };
}

function asIs(result) {
    const _res934426595 = result;
    switch (_res934426595.kind) {
        case "Err": {
            const { error } = _res934426595;
            return Err({ error });
        }
        case "Ok": {
            const { value } = _res934426595;
            return Ok({ value });
        }
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("UnionTypeBlock", 1, rawOneLine.split("\n")),
        UnparsedBlock("FunctionBlock", 3, functionPart.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("UnionTypeBlock", 0, rawMultiLine.split("\n")),
        UnparsedBlock("FunctionBlock", 4, multilineFunctionPart.split("\n")),
    ]);
}

export function testBlockKind() {
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("UnionType"), Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("UnionType"), Ok("Function") ]
    );
}

export function testParse() {
    const returnType = FixedType("Result", [
        GenericType("a"),
        GenericType("b"),
    ]);

    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                UnionType(returnType, [
                    Tag("Err", [ TagArg("error", GenericType("a")) ]),
                    Tag("Ok", [ TagArg("value", GenericType("b")) ]),
                ]),
                Function(
                    "asIs",
                    returnType,
                    [ FunctionArg("result", returnType) ],
                    [ ],
                    CaseStatement(Value("result"), [
                        Branch(
                            Destructure("Err", "{ error }"),
                            Constructor(
                                "Err",
                                ObjectLiteral(null, [
                                    Field("error", Value("error")),
                                ])
                            ),
                            [ ]
                        ),
                        Branch(
                            Destructure("Ok", "{ value }"),
                            Constructor(
                                "Ok",
                                ObjectLiteral(null, [
                                    Field("value", Value("value")),
                                ])
                            ),
                            [ ]
                        ),
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
                UnionType(returnType, [
                    Tag("Err", [ TagArg("error", GenericType("a")) ]),
                    Tag("Ok", [ TagArg("value", GenericType("b")) ]),
                ]),
                Function(
                    "asIs",
                    returnType,
                    [ FunctionArg("result", returnType) ],
                    [ ],
                    CaseStatement(Value("result"), [
                        Branch(
                            Destructure("Err", "{ error }"),
                            Constructor(
                                "Err",
                                ObjectLiteral(null, [
                                    Field("error", Value("error")),
                                ])
                            ),
                            [ ]
                        ),
                        Branch(
                            Destructure("Ok", "{ value }"),
                            Constructor(
                                "Ok",
                                ObjectLiteral(null, [
                                    Field("value", Value("value")),
                                ])
                            ),
                            [ ]
                        ),
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
