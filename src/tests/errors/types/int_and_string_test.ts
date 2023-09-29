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
