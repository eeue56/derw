import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse, stripComments } from "../parser";
import {
    ArrowToken,
    AssignToken,
    CloseBracketToken,
    ColonToken,
    IdentifierToken,
    OpenBracketToken,
    tokenize,
    WhitespaceToken,
} from "../tokens";
import {
    Comment,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    GenericType,
    Module,
    ModuleReference,
    UnparsedBlock,
} from "../types";

const oneLine = `
-- turn anything into a string
toString: any -> string
toString buffer = buffer.toString()
`.trim();

const multiLine = `
-- turn anything into a string
toString: any -> string
toString buffer =
    -- hello
    -- world
    buffer.toString()
`.trim();

const expectedOutput = `
function toString(buffer: any): string {
    return buffer.toString();
}
`.trim();

const expectedOutputJS = `
function toString(buffer) {
    return buffer.toString();
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("CommentBlock", 0, oneLine.split("\n").slice(0, 1)),
        UnparsedBlock("FunctionBlock", 1, oneLine.split("\n").slice(1)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("CommentBlock", 0, multiLine.split("\n").slice(0, 1)),
        UnparsedBlock("FunctionBlock", 1, multiLine.split("\n").slice(1)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Comment"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Comment"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Comment("turn anything into a string"),
                Function(
                    "toString",
                    FixedType("string", [ ]),
                    [ FunctionArg("buffer", GenericType("any")) ],
                    [ ],
                    ModuleReference([ "buffer" ], FunctionCall("toString", [ ]))
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
                Comment("turn anything into a string"),
                Function(
                    "toString",
                    FixedType("string", [ ]),
                    [ FunctionArg("buffer", GenericType("any")) ],
                    [ ],
                    ModuleReference([ "buffer" ], FunctionCall("toString", [ ]))
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

export function testStripComments() {
    const tokens = tokenize(oneLine);
    const withoutComments = stripComments(tokens);

    assert.deepStrictEqual(withoutComments, [
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        ColonToken(),
        WhitespaceToken(" "),
        IdentifierToken("any"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("string"),
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        WhitespaceToken(" "),
        IdentifierToken("buffer"),
        WhitespaceToken(" "),
        AssignToken(),
        WhitespaceToken(" "),
        IdentifierToken("buffer.toString"),
        OpenBracketToken(),
        CloseBracketToken(),
    ]);
}

export function testStripCommentsMultiLine() {
    const tokens = tokenize(multiLine);
    const withoutComments = stripComments(tokens);

    assert.deepStrictEqual(withoutComments, [
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        ColonToken(),
        WhitespaceToken(" "),
        IdentifierToken("any"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("string"),
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        WhitespaceToken(" "),
        IdentifierToken("buffer"),
        WhitespaceToken(" "),
        AssignToken(),
        WhitespaceToken("\n    "),
        WhitespaceToken("\n    "),
        WhitespaceToken("\n    "),
        IdentifierToken("buffer.toString"),
        OpenBracketToken(),
        CloseBracketToken(),
    ]);
}
