import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import {
    Branch,
    CaseStatement,
    Constructor,
    Destructure,
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    IfStatement,
    Module,
    Tag,
    TagArg,
    Type,
    UnionType,
    Value,
} from "./types";
import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "./compile";

const functionPart = `
asIs : Result a b -> Result a b
asIs result =
    case result of
        Err { error } -> Err { error }
        Ok { value } -> Ok { value }
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

const multiLine = `
${rawMultiLine}

${functionPart}
`.trim();

const expectedOutput = `
type Err<a> = {
    kind: "Err";
    error: a;
}

function Err<a>(args: { error: a }): Err<a> {
    return {
        kind: "Err",
        ...args
    }
}

type Ok<b> = {
    kind: "Ok";
    value: b;
}

function Ok<b>(args: { value: b }): Ok<b> {
    return {
        kind: "Ok",
        ...args
    }
}

type Result<a, b> = Err<a> | Ok<b>;

function asIs<a, b>(result: Result<a, b>): Result<a, b> {
    switch (result.kind) {
        case "Err": {
            const { error } = result;
            return Err({ error });
        }
        case "Ok": {
            const { value } = result;
            return Ok({ value });
        }
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ rawOneLine, functionPart ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        rawMultiLine,
        functionPart,
    ]);
}

export function testBlockKind() {
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(blocks.map(blockKind), [
        Ok("UnionType"),
        Ok("Function"),
    ]);
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(blocks.map(blockKind), [
        Ok("UnionType"),
        Ok("Function"),
    ]);
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
                    CaseStatement(Value("result"), [
                        Branch(
                            Destructure("Err", "{ error }"),
                            Constructor("Err", "{ error }")
                        ),
                        Branch(
                            Destructure("Ok", "{ value }"),
                            Constructor("Ok", "{ value }")
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
                    CaseStatement(Value("result"), [
                        Branch(
                            Destructure("Err", "{ error }"),
                            Constructor("Err", "{ error }")
                        ),
                        Branch(
                            Destructure("Ok", "{ value }"),
                            Constructor("Ok", "{ value }")
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
