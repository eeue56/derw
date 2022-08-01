import * as assert from "@eeue56/ts-assert";
import { Just, Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    BlockKinds,
    Import,
    ImportModule,
    Module,
    UnparsedBlock,
} from "../types";

const oneLine = `import path
import fs
import "./other"
import "./something" as banana
import "./another" exposing (isTrue, isFalse)
import "./nothing" exposing(isNothing)`.trim();

const multiLine = `
import path
import fs
import "./other"
import "./something" as banana
import "./another" exposing (isTrue, isFalse)
import "./nothing" exposing(isNothing)
`.trim();

const expectedOutput = `
import * as path from "path";

import * as fs from "fs";

import * as other from "./other";

import * as banana from "./something";

import { isTrue, isFalse } from "./another";

import { isNothing } from "./nothing";
`.trim();

const expectedOutputJS = `
import * as path from "path";

import * as fs from "fs";

import * as other from "./other";

import * as banana from "./something";

import { isTrue, isFalse } from "./another";

import { isNothing } from "./nothing";
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ImportBlock", 0, [ oneLine.split("\n")[0] ]),
        UnparsedBlock("ImportBlock", 1, [ oneLine.split("\n")[1] ]),
        UnparsedBlock("ImportBlock", 2, [ oneLine.split("\n")[2] ]),
        UnparsedBlock("ImportBlock", 3, [ oneLine.split("\n")[3] ]),
        UnparsedBlock("ImportBlock", 4, [ oneLine.split("\n")[4] ]),
        UnparsedBlock("ImportBlock", 5, [ oneLine.split("\n")[5] ]),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ImportBlock", 0, [ multiLine.split("\n")[0] ]),
        UnparsedBlock("ImportBlock", 1, [ multiLine.split("\n")[1] ]),
        UnparsedBlock("ImportBlock", 2, [ multiLine.split("\n")[2] ]),
        UnparsedBlock("ImportBlock", 3, [ multiLine.split("\n")[3] ]),
        UnparsedBlock("ImportBlock", 4, [ multiLine.split("\n")[4] ]),
        UnparsedBlock("ImportBlock", 5, [ multiLine.split("\n")[5] ]),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine),
        Ok<string, BlockKinds>("Import")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("Import")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Import([ ImportModule("path", Nothing(), [ ], "Global") ]),
                Import([ ImportModule("fs", Nothing(), [ ], "Global") ]),
                Import([
                    ImportModule(`"./other"`, Nothing(), [ ], "Relative"),
                ]),
                Import([
                    ImportModule(
                        `"./something"`,
                        Just("banana"),
                        [ ],
                        "Relative"
                    ),
                ]),
                Import([
                    ImportModule(
                        `"./another"`,
                        Nothing(),
                        [ "isTrue", "isFalse" ],
                        "Relative"
                    ),
                ]),
                Import([
                    ImportModule(
                        `"./nothing"`,
                        Nothing(),
                        [ "isNothing" ],
                        "Relative"
                    ),
                ]),
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
                Import([ ImportModule("path", Nothing(), [ ], "Global") ]),
                Import([ ImportModule("fs", Nothing(), [ ], "Global") ]),
                Import([
                    ImportModule(`"./other"`, Nothing(), [ ], "Relative"),
                ]),
                Import([
                    ImportModule(
                        `"./something"`,
                        Just("banana"),
                        [ ],
                        "Relative"
                    ),
                ]),
                Import([
                    ImportModule(
                        `"./another"`,
                        Nothing(),
                        [ "isTrue", "isFalse" ],
                        "Relative"
                    ),
                ]),
                Import([
                    ImportModule(
                        `"./nothing"`,
                        Nothing(),
                        [ "isNothing" ],
                        "Relative"
                    ),
                ]),
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
