import { deepStrictEqual } from "@eeue56/ts-assert";
import { parse } from "../../parser";

export function testLetIn() {
    const str = `
sayHi: string -> string
sayHi name =
    let
        x: number
        x = 5
    in
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [ ]);
}

export function testLetWithoutIn() {
    const str = `
sayHi: string -> string
sayHi name =
    let
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing in after let. let should be followed by in.\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    let\n" +
            "        name\n" +
            "```",
    ]);
}

export function testInWithoutLet() {
    const str = `
sayHi: string -> string
sayHi name =
    in
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing let before in.\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    in\n" +
            "        name\n" +
            "```",
    ]);
}

export function testDoWithoutReturn() {
    const str = `
sayHi: string -> string
sayHi name =
    do
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing return after do.\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    do\n" +
            "        name\n" +
            "```",
    ]);
}

export function testReturnWithoutDo() {
    const str = `
sayHi: string -> string
sayHi name =
    return
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing do before return.\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    return\n" +
            "        name\n" +
            "```",
    ]);
}

export function testDoReturn() {
    const str = `
sayHi: string -> string
sayHi name =
    do
        x: number
        x = 5
    return
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [ ]);
}

export function testLetInAndDoReturn() {
    const str = `
sayHi: string -> string
sayHi name =
    let
        x: number
        x = 5
    in
    do
        globalThis.console.log "hello"
    return
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [ ]);
}

export function testLetWithoutInAndDo() {
    const str = `
sayHi: string -> string
sayHi name =
    let
        x: number
        x = 5
    do
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing in after let, missing return after do. let should be followed by in, and do followed by return.\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    let\n" +
            "        x: number\n" +
            "        x = 5\n" +
            "    do\n" +
            "        name\n" +
            "```",
    ]);
}

export function testLetWithoutInAndReturn() {
    const str = `
sayHi: string -> string
sayHi name =
    let
        x: number
        x = 5
    return
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing in after let, but found return without do. Did you mean to do let..in or do..return instead of let..return?\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    let\n" +
            "        x: number\n" +
            "        x = 5\n" +
            "    return\n" +
            "        name\n" +
            "```",
    ]);
}

export function testInWithoutLetAndDo() {
    const str = `
sayHi: string -> string
sayHi name =
    do
        x: number
        x = 5
    in
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing let before in, missing return after do. Did you mean to do let..in or do..return instead of do..in?\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    do\n" +
            "        x: number\n" +
            "        x = 5\n" +
            "    in\n" +
            "        name\n" +
            "```",
    ]);
}

export function testInWithoutLetAndReturn() {
    const str = `
sayHi: string -> string
sayHi name =
    return
        x: number
        x = 5
    in
        name
    `.trim();

    const parsed = parse(str);
    deepStrictEqual(parsed.errors, [
        "Line 0: Missing let before in, but found return without do. Did you mean to do let..in instead of in..return?\n" +
            "```\n" +
            "sayHi: string -> string\n" +
            "sayHi name =\n" +
            "    return\n" +
            "        x: number\n" +
            "        x = 5\n" +
            "    in\n" +
            "        name\n" +
            "```",
    ]);
}
