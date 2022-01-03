import { deepStrictEqual } from "@eeue56/ts-assert";
import { addMissingNamesSuggestions } from "../../errors/names";
import { parse } from "../../parser";

export function testSingleName() {
    const str = `
world: string
world =
    "hello"

hello: string
hello =
    world
`.trim();
    let parsed = parse(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testSingleNameWithFnCall() {
    const str = `
world: string
world =
    "hello"

fn: string -> string
fn x =
    "hello"

hello: string
hello =
    fn world
`.trim();
    let parsed = parse(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testSingleNameWithNestedFnCall() {
    const str = `
world: string
world =
    "hello"

one: string -> string
one x =
    "hello"

two: string -> string
two x =
    "hello"

hello: string
hello =
    one (two world)
`.trim();
    let parsed = parse(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testFnWithSingleArg() {
    const str = `
fn: string -> string
fn x =
    "hello"

hello: string -> string
hello name =
    fn name
`.trim();
    let parsed = parse(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testFnWithTwoArgs() {
    const str = `
import "./String" exposing (fromNumber)

hello: string -> number -> string
hello name age =
    name + (fromNumber age)
`.trim();
    let parsed = parse(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testLambda() {
    const str = `
hello: number -> number
hello age =
    age
        |> (\\x -> x + 1)
`.trim();
    let parsed = parse(str, "Main");
    parsed = addMissingNamesSuggestions(parsed);

    deepStrictEqual(parsed.errors, [ ]);
}
