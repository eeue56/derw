import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    FunctionType,
    GenericType,
    Lambda,
    ListValue,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
filterMap: (a -> Maybe b) -> List a -> List b
filterMap fn xs = foldl (\\y ys -> filterMapHelp fn y ys) [] xs
`.trim();

const multiLine = `
filterMap: (a -> Maybe b) -> List a -> List b
filterMap fn xs =
    foldl (\\y ys -> filterMapHelp fn y ys) [ ] xs
`.trim();

const expectedOutput = `
function filterMap<a, b>(fn: (arg0: a) => Maybe<b>, xs: a[]): b[] {
    return foldl(function(y: any, ys: any) {
        return filterMapHelp(fn, y, ys);
    }, [ ], xs);
}
`.trim();

const expectedOutputJS = `
function filterMap(fn, xs) {
    return foldl(function(y, ys) {
        return filterMapHelp(fn, y, ys);
    }, [ ], xs);
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
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "filterMap",
                    FixedType("List", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([
                                GenericType("a"),
                                FixedType("Maybe", [ GenericType("b") ]),
                            ])
                        ),
                        FunctionArg(
                            "xs",
                            FixedType("List", [ GenericType("a") ])
                        ),
                    ],
                    [ ],
                    FunctionCall("foldl", [
                        Lambda(
                            [ "y", "ys" ],
                            FunctionCall("filterMapHelp", [
                                Value("fn"),
                                Value("y"),
                                Value("ys"),
                            ])
                        ),
                        ListValue([ ]),
                        Value("xs"),
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
                    "filterMap",
                    FixedType("List", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([
                                GenericType("a"),
                                FixedType("Maybe", [ GenericType("b") ]),
                            ])
                        ),
                        FunctionArg(
                            "xs",
                            FixedType("List", [ GenericType("a") ])
                        ),
                    ],
                    [ ],
                    FunctionCall("foldl", [
                        Lambda(
                            [ "y", "ys" ],
                            FunctionCall("filterMapHelp", [
                                Value("fn"),
                                Value("y"),
                                Value("ys"),
                            ])
                        ),
                        ListValue([ ]),
                        Value("xs"),
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

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
