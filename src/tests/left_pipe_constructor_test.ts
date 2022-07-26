import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Const,
    Constructor,
    Field,
    FunctionCall,
    GenericType,
    Lambda,
    LeftPipe,
    Module,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
helloWorld: any
helloWorld = after (\\_ -> Just { value: 5 } |> send)
`.trim();

const multiLine = `
helloWorld: any
helloWorld =
    after (\\_ -> Just { value: 5 } |> send)
`.trim();

const expectedOutput = `
const helloWorld: any = after(function(_: any) {
    return send(Just({ value: 5 }));
});
`.trim();

const expectedOutputJS = `
const helloWorld = after(function(_) {
    return send(Just({ value: 5 }));
});
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
                    "helloWorld",
                    GenericType("any"),
                    [ ],
                    FunctionCall("after", [
                        Lambda(
                            [ "_" ],
                            LeftPipe(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", Value("5")),
                                    ])
                                ),
                                Value("send")
                            )
                        ),
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
                    "helloWorld",
                    GenericType("any"),
                    [ ],
                    FunctionCall("after", [
                        Lambda(
                            [ "_" ],
                            LeftPipe(
                                Constructor(
                                    "Just",
                                    ObjectLiteral(null, [
                                        Field("value", Value("5")),
                                    ])
                                ),
                                Value("send")
                            )
                        ),
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
