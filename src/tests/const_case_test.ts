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
    Const,
    Default,
    FixedType,
    Module,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
name: string
name =
    case person of
        "noah" -> "Noah"
        "james" -> "James"
        default -> "other"
`.trim();

const multiLine = `
name: string
name =
    case person of
        "noah" -> "Noah"
        "james" -> "James"
        default -> "other"
`.trim();

const expectedOutput = `
const name: string = (function (): any {
    const _res = person;
    switch (_res) {
        case "noah": {
            return "Noah";
        }
        case "james": {
            return "James";
        }
        default: {
            return "other";
        }
    }
})();
`.trim();

const expectedOutputJS = `
const name = (function () {
    const _res = person;
    switch (_res) {
        case "noah": {
            return "Noah";
        }
        case "james": {
            return "James";
        }
        default: {
            return "other";
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
                    "name",
                    FixedType("string", [ ]),
                    CaseStatement(Value("person"), [
                        Branch(StringValue("noah"), StringValue("Noah"), [ ]),
                        Branch(StringValue("james"), StringValue("James"), [ ]),
                        Branch(Default(), StringValue("other"), [ ]),
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
                Const(
                    "name",
                    FixedType("string", [ ]),
                    CaseStatement(Value("person"), [
                        Branch(StringValue("noah"), StringValue("Noah"), [ ]),
                        Branch(StringValue("james"), StringValue("James"), [ ]),
                        Branch(Default(), StringValue("other"), [ ]),
                    ])
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
