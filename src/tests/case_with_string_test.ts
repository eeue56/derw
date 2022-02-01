import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import { generateTypescript } from "../ts_generator";
import {
    Branch,
    CaseStatement,
    Default,
    FixedType,
    Function,
    FunctionArg,
    Module,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
sayHello: string -> string
sayHello name =
    case name of
        "Noah" -> "Hi Noah"
        "James" -> "Greetings"
        default -> "I don't know you"
`.trim();

const multiLine = `
sayHello: string -> string
sayHello name =
    case name of
        "Noah" -> "Hi Noah"
        "James" -> "Greetings"
        default -> "I don't know you"
`.trim();

const expectedOutput = `
function sayHello(name: string): string {
    const _res3373707 = name;
    switch (_res3373707) {
        case "Noah": {
            return "Hi Noah";
        }
        case "James": {
            return "Greetings";
        }
        default: {
            return "I don't know you";
        }
    }
}
`.trim();

const expectedOutputJS = `
function sayHello(name) {
    const _res3373707 = name;
    switch (_res3373707) {
        case "Noah": {
            return "Hi Noah";
        }
        case "James": {
            return "Greetings";
        }
        default: {
            return "I don't know you";
        }
    }
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
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "sayHello",
                    FixedType("string", [ ]),
                    [ FunctionArg("name", FixedType("string", [ ])) ],
                    [ ],
                    CaseStatement(Value("name"), [
                        Branch(
                            StringValue("Noah"),
                            StringValue("Hi Noah"),
                            [ ]
                        ),
                        Branch(
                            StringValue("James"),
                            StringValue("Greetings"),
                            [ ]
                        ),
                        Branch(Default(), StringValue("I don't know you"), [ ]),
                    ])
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
                Function(
                    "sayHello",
                    FixedType("string", [ ]),
                    [ FunctionArg("name", FixedType("string", [ ])) ],
                    [ ],
                    CaseStatement(Value("name"), [
                        Branch(
                            StringValue("Noah"),
                            StringValue("Hi Noah"),
                            [ ]
                        ),
                        Branch(
                            StringValue("James"),
                            StringValue("Greetings"),
                            [ ]
                        ),
                        Branch(Default(), StringValue("I don't know you"), [ ]),
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
