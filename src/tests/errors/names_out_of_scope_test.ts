import { deepStrictEqual } from "@eeue56/ts-assert";
import { addMissingNamesSuggestions } from "../../errors/names";
import { parseWithContext } from "../../parser";

export function testSingleName() {
    const str = `
hello: string
hello =
    world
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [
        "Failed to find `world` in the scope of `hello`.",
    ]);
}

export function testSingleNameWithFnCall() {
    const str = `
hello: string
hello =
    fn world
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [
        "Failed to find `fn` in the scope of `hello`.",
        "Failed to find `world` in the scope of `hello`.",
    ]);
}

export function testSingleNameWithNestedFnCall() {
    const str = `
hello: string
hello =
    one (two world)
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [
        "Failed to find `one` in the scope of `hello`.",
        "Failed to find `two` in the scope of `hello`.",
        "Failed to find `world` in the scope of `hello`.",
    ]);
}

export function testFnWithSingleArg() {
    const str = `
hello: string -> string
hello name =
    fn name
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [
        "Failed to find `fn` in the scope of `hello`.",
    ]);
}

export function testFnWithTwoArgs() {
    const str = `
hello: string -> number -> string
hello name age =
    name + (fromNumber age)
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [
        "Failed to find `fromNumber` in the scope of `hello`.",
    ]);
}
