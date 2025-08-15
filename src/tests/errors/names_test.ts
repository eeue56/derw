import { deepStrictEqual } from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks } from "../../Blocks";
import { namesPerBlock } from "../../errors/names";
import { parseBlock } from "../../parser";
import { Block } from "../../types";

export function testSingleName() {
    const str = `
hello: string
hello =
    world
`.trim();
    const block = intoBlocks(str)[0];
    const parsedBlock = (parseBlock(block) as Ok<Block>).value;

    deepStrictEqual(namesPerBlock(parsedBlock), ["hello", "world"]);
}

export function testSingleNameWithFnCall() {
    const str = `
hello: string
hello =
    fn world
`.trim();
    const block = intoBlocks(str)[0];
    const parsedBlock = (parseBlock(block) as Ok<Block>).value;

    deepStrictEqual(namesPerBlock(parsedBlock), ["hello", "fn", "world"]);
}

export function testSingleNameWithNestedFnCall() {
    const str = `
hello: string
hello =
    one (two world)
`.trim();
    const block = intoBlocks(str)[0];
    const parsedBlock = (parseBlock(block) as Ok<Block>).value;

    deepStrictEqual(namesPerBlock(parsedBlock), [
        "hello",
        "one",
        "two",
        "world",
    ]);
}

export function testFnWithSingleArg() {
    const str = `
hello: string -> string
hello name =
    name
`.trim();
    const block = intoBlocks(str)[0];
    const parsedBlock = (parseBlock(block) as Ok<Block>).value;

    deepStrictEqual(namesPerBlock(parsedBlock), ["hello", "name"]);
}

export function testFnWithTwoArgs() {
    const str = `
hello: string -> number -> string
hello name age =
    name + (fromNumber age)
`.trim();
    const block = intoBlocks(str)[0];
    const parsedBlock = (parseBlock(block) as Ok<Block>).value;

    deepStrictEqual(namesPerBlock(parsedBlock), [
        "hello",
        "name",
        "fromNumber",
        "age",
    ]);
}
