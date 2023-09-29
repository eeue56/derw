import { deepStrictEqual } from "@eeue56/ts-assert";
import { addTypeErrors, parseWithContext } from "../../../parser";

export function testIntToIntPerfect() {
    const str = `
doSomething: number -> number
doSomething x =
    x + x
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testStringToStringPerfect() {
    const str = `
doSomething: string -> string
doSomething x =
    x
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testIntToStringError() {
    const str = `
doSomething: number -> string
doSomething x =
    x + x
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 0 - 3\n" +
            "Expected `string` but got `number` in the body of the function:\n" +
            "```\n" +
            "doSomething: number -> string\n" +
            "doSomething x =\n" +
            "    x + x\n" +
            "```",
    ]);
}

export function testStringToIntError() {
    const str = `
doSomething: string -> number
doSomething x =
    x + x
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 0 - 3\n" +
            "Expected `number` but got `string` in the body of the function:\n" +
            "```\n" +
            "doSomething: string -> number\n" +
            "doSomething x =\n" +
            "    x + x\n" +
            "```",
    ]);
}

export function testStringPlusIntError() {
    const str = `
something: string
something =
    "hello" + 99
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 0 - 3\n" +
            "Mismatching types between the left of the addition: string and the right of the addition: number\n" +
            "In Derw, types of both sides of an addition must be the same.\n" +
            "Try using a format string via `` instead\n" +
            "For example, `hello${99}`:\n" +
            "```\n" +
            "something: string\n" +
            "something =\n" +
            '    "hello" + 99\n' +
            "```",
    ]);
}

export function testStringPlusIntFunctionError() {
    const str = `
something: string -> number -> string
something x y =
    x + y
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 0 - 3\n" +
            "Mismatching types between the left of the addition: string and the right of the addition: number\n" +
            "In Derw, types of both sides of an addition must be the same.\n" +
            "Try using a format string via `` instead\n" +
            "For example, `${x}${y}`:\n" +
            "```\n" +
            "something: string -> number -> string\n" +
            "something x y =\n" +
            "    x + y\n" +
            "```",
    ]);
}

export function testIntPlusStringFunctionError() {
    const str = `
something: number -> string -> string
something x y =
    x + y
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 0 - 3\n" +
            "Mismatching types between the left of the addition: number and the right of the addition: string\n" +
            "In Derw, types of both sides of an addition must be the same.\n" +
            "Try using a format string via `` instead\n" +
            "For example, `${x}${y}`:\n" +
            "```\n" +
            "something: number -> string -> string\n" +
            "something x y =\n" +
            "    x + y\n" +
            "```",
    ]);
}
