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
    Equality,
    FixedType,
    FunctionCall,
    Lambda,
    Module,
    ModuleReference,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
withoutItem: List ListItem
withoutItem = List.filter (\\x -> x.label == item.label) model.list
`.trim();

const multiLine = `
withoutItem: List ListItem
withoutItem =
    List.filter (\\x -> x.label == item.label) model.list
`.trim();

const expectedOutput = `
const withoutItem: ListItem[] = List.filter(function(x: any) {
    return x.label === item.label;
}, model.list);
`.trim();

const expectedOutputJS = `
const withoutItem = List.filter(function(x) {
    return x.label === item.label;
}, model.list);
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
                    "withoutItem",
                    FixedType("List", [FixedType("ListItem", [])]),
                    [],
                    ModuleReference(
                        ["List"],
                        FunctionCall("filter", [
                            Lambda(
                                ["x"],
                                Equality(
                                    ModuleReference(["x"], Value("label")),
                                    ModuleReference(["item"], Value("label"))
                                )
                            ),
                            ModuleReference(["model"], Value("list")),
                        ])
                    )
                ),
            ],
            []
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
                    "withoutItem",
                    FixedType("List", [FixedType("ListItem", [])]),
                    [],
                    ModuleReference(
                        ["List"],
                        FunctionCall("filter", [
                            Lambda(
                                ["x"],
                                Equality(
                                    ModuleReference(["x"], Value("label")),
                                    ModuleReference(["item"], Value("label"))
                                )
                            ),
                            ModuleReference(["model"], Value("list")),
                        ])
                    )
                ),
            ],
            []
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
