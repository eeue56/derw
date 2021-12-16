import * as assert from "@eeue56/ts-assert";
import { intoBlocks } from "../blocks";
import { parse } from "../parser";
import { UnparsedBlock } from "../types";

const oneLine = `
isEqual: boolean
isEqual = 1 == 2

isEqual: boolean
isEqual = 1 != 2

type Robot = Robot

type alias Robot = { name : string }

Robot: number -> number
Robot x = x
`.trim();

const multiLine = `
isEqual: boolean
isEqual =
    1 == 2

isEqual: boolean
isEqual =
    1 != 2

type Robot = Robot

type alias Robot = {
    name : string
}

Robot: number -> number
Robot x =
    x
`.trim();

export function testIntoBlocks() {
    const lines = oneLine.split("\n");

    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, [ lines[0], lines[1] ]),
        UnparsedBlock("ConstBlock", 3, [ lines[3], lines[4] ]),
        UnparsedBlock("UnionTypeBlock", 6, [ lines[6] ]),
        UnparsedBlock("TypeAliasBlock", 8, [ lines[8] ]),
        UnparsedBlock("FunctionBlock", 10, [ lines[10], lines[11] ]),
    ]);
}

export function testIntoBlocksMultiLine() {
    const lines = multiLine.split("\n");

    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, lines.slice(0, 3)),
        UnparsedBlock("ConstBlock", 4, lines.slice(4, 7)),
        UnparsedBlock("UnionTypeBlock", 8, lines.slice(8, 9)),
        UnparsedBlock("TypeAliasBlock", 10, lines.slice(10, 13)),
        UnparsedBlock("FunctionBlock", 14, lines.slice(14, 17)),
    ]);
}

export function testParse() {
    assert.deepStrictEqual(parse(oneLine).errors.length, 2);
}

export function testParseMultiLine() {
    assert.deepStrictEqual(parse(multiLine).errors.length, 2);
}
