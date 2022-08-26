import { deepStrictEqual } from "@eeue56/ts-assert";
import { addTypeErrors, parseWithContext } from "../../parser";

export function testUnionUntaggedPerfect() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "one" -> "hello"
        "two" -> "world"
        "three" -> "."
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testUnionUntaggedOneMissingBranch() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "one" -> "hello"
        "two" -> "world"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 10\n" +
            "The case statement did not match the untagged union Branches\n" +
            `All possible branches of a untagged union must be covered. I expected a branch for "three" but they were missing. If you don't need one, have a default branch:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        "one" -> "hello"\n' +
            '        "two" -> "world"\n' +
            "```",
    ]);
}

export function testUnionUntaggedSeveralMissingBranches() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "one" -> "hello"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 9\n" +
            "The case statement did not match the untagged union Branches\n" +
            `All possible branches of a untagged union must be covered. I expected a branch for "two" | "three" but they were missing. If you don't need one, have a default branch:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        "one" -> "hello"\n' +
            "```",
    ]);
}

export function testUnionUntaggedOneExtraBranch() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "one" -> "hello"
        "two" -> "world"
        "three" -> "goodbye"
        "four" -> "world"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 12\n" +
            "The case statement did not match the untagged union Branches\n" +
            `I got too many branches. The branches for "four" aren't part of the untagged union so will never be true. Remove them.:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        "one" -> "hello"\n' +
            '        "two" -> "world"\n' +
            '        "three" -> "goodbye"\n' +
            '        "four" -> "world"\n' +
            "```",
    ]);
}

export function testUnionUntaggedSeveralExtraBranches() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "five" -> "."
        "one" -> "hello"
        "two" -> "world"
        "three" -> "goodbye"
        "four" -> "world"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 13\n" +
            "The case statement did not match the untagged union Branches\n" +
            `I got too many branches. The branches for "five" | "four" aren't part of the untagged union so will never be true. Remove them.:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        "five" -> "."\n' +
            '        "one" -> "hello"\n' +
            '        "two" -> "world"\n' +
            '        "three" -> "goodbye"\n' +
            '        "four" -> "world"\n' +
            "```",
    ]);
}

export function testUnionUntaggedOneMissingBranchWithDefault() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "one" -> "hello"
        "two" -> "world"
        default -> "."
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testUnionUntaggedOneExtraBranchWithDefault() {
    const str = `
type Branches =
    "one"
    | "two"
    | "three"

doSomething: Branches -> string
doSomething branches =
    case branches of
        "one" -> "hello"
        "two" -> "world"
        "three" -> "goodbye"
        "four" -> "world"
        default -> "."
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 13\n" +
            "The case statement did not match the untagged union Branches\n" +
            `I got too many branches. The branches for "four" aren't part of the untagged union so will never be true. Remove them.:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        "one" -> "hello"\n' +
            '        "two" -> "world"\n' +
            '        "three" -> "goodbye"\n' +
            '        "four" -> "world"\n' +
            '        default -> "."\n' +
            "```",
    ]);
}

export function testUnionPerfect() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        One -> "hello"
        Two -> "world"
        Three -> "."
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testUnionOneMissingBranch() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        One -> "hello"
        Two -> "world"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 10\n" +
            "The case statement did not match the union Branches\n" +
            `All possible branches of a union must be covered. I expected a branch for Three but they were missing. If you don't need one, have a default branch:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        One -> "hello"\n' +
            '        Two -> "world"\n' +
            "```",
    ]);
}

export function testUnionSeveralMissingBranches() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        One -> "hello"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 9\n" +
            "The case statement did not match the union Branches\n" +
            `All possible branches of a union must be covered. I expected a branch for Two | Three but they were missing. If you don't need one, have a default branch:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        One -> "hello"\n' +
            "```",
    ]);
}

export function testUnionOneExtraBranch() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        One -> "hello"
        Two -> "world"
        Three -> "goodbye"
        Four -> "world"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 12\n" +
            "The case statement did not match the union Branches\n" +
            `I got too many branches. The branches for Four aren't part of the union so will never be true. Remove them.:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        One -> "hello"\n' +
            '        Two -> "world"\n' +
            '        Three -> "goodbye"\n' +
            '        Four -> "world"\n' +
            "```",
    ]);
}

export function testUnionSeveralExtraBranches() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        Five -> "."
        One -> "hello"
        Two -> "world"
        Three -> "goodbye"
        Four -> "world"
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 13\n" +
            "The case statement did not match the union Branches\n" +
            `I got too many branches. The branches for Five | Four aren't part of the union so will never be true. Remove them.:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        Five -> "."\n' +
            '        One -> "hello"\n' +
            '        Two -> "world"\n' +
            '        Three -> "goodbye"\n' +
            '        Four -> "world"\n' +
            "```",
    ]);
}

export function testUnionMissingBranchWithDefault() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        One -> "hello"
        Two -> "world"
        default -> "."
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [ ]);
}

export function testUnionOneExtraBranchWithDefault() {
    const str = `
type Branches =
    One
    | Two
    | Three

doSomething: Branches -> string
doSomething branches =
    case branches of
        One -> "hello"
        Two -> "world"
        Three -> "goodbye"
        Four -> "world"
        default -> "."
`.trim();
    let parsed = parseWithContext(str, "Main");
    parsed = addTypeErrors(parsed, [ ]);

    deepStrictEqual(parsed.errors, [
        "Error on lines 5 - 13\n" +
            "The case statement did not match the union Branches\n" +
            `I got too many branches. The branches for Four aren't part of the union so will never be true. Remove them.:\n` +
            "```\n" +
            "doSomething: Branches -> string\n" +
            "doSomething branches =\n" +
            "    case branches of\n" +
            '        One -> "hello"\n' +
            '        Two -> "world"\n' +
            '        Three -> "goodbye"\n' +
            '        Four -> "world"\n' +
            '        default -> "."\n' +
            "```",
    ]);
}
