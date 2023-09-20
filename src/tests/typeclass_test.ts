import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    And,
    Equality,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    GenericType,
    IfStatement,
    Impl,
    Module,
    ModuleReference,
    Property,
    TypeAlias,
    Typeclass,
    TypeclassFunction,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
type alias User = {
    name: string,
    age: number
}

typeclass Eq a
    equals: a -> a -> boolean

    notEquals: a -> a -> boolean

impl Eq User
    equals: User -> User -> boolean
    equals a b =
        a.name == b.name && a.age == b.age

    notEquals: User -> User -> boolean
    notEquals a b =
        if a == b then
            false
        else
            true

isSameUser: User -> User -> boolean
isSameUser a b =
    equals a b
`.trim();

const multiLine = `
type alias User = {
    name: string,
    age: number
}

typeclass Eq a
    equals: a -> a -> boolean

    notEquals: a -> a -> boolean

impl Eq User
    equals: User -> User -> boolean
    equals a b =
        a.name == b.name && a.age == b.age

    notEquals: User -> User -> boolean
    notEquals a b =
        if a == b then
            false
        else
            true

isSameUser: User -> User -> boolean
isSameUser a b =
    equals a b
`.trim();

const expectedOutput = `
type User = {
    name: string;
    age: number;
}

function User(args: { name: string, age: number }): User {
    return {
        ...args,
    };
}

function isSameUser(a: User, b: User): boolean {
    return equals(a, b);
}
`.trim();

const expectedOutputJS = `
function User(args) {
    return {
        ...args,
    };
}

function isSameUser(a, b) {
    return equals(a, b);
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n").slice(0, 4)),
        UnparsedBlock("TypeclassBlock", 5, oneLine.split("\n").slice(5, 9)),
        UnparsedBlock("ImplBlock", 10, oneLine.split("\n").slice(10, 21)),
        UnparsedBlock(
            "FunctionBlock",
            22,
            oneLine.split("\n").slice(22, oneLine.split("\n").length)
        ),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n").slice(0, 4)),
        UnparsedBlock("TypeclassBlock", 5, multiLine.split("\n").slice(5, 9)),
        UnparsedBlock("ImplBlock", 10, oneLine.split("\n").slice(10, 21)),
        UnparsedBlock(
            "FunctionBlock",
            22,
            oneLine.split("\n").slice(22, oneLine.split("\n").length)
        ),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("TypeAlias"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("TypeAlias"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                TypeAlias(FixedType("User", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),
                Typeclass(
                    "Eq",
                    [ GenericType("a") ],
                    [
                        TypeclassFunction("equals", FixedType("boolean", [ ]), [
                            GenericType("a"),
                            GenericType("a"),
                        ]),
                        TypeclassFunction(
                            "notEquals",
                            FixedType("boolean", [ ]),
                            [ GenericType("a"), GenericType("a") ]
                        ),
                    ]
                ),
                Impl("Eq", FixedType("User", [ ]), [
                    Function(
                        "equals",
                        FixedType("boolean", [ ]),
                        [
                            FunctionArg("a", FixedType("User", [ ])),
                            FunctionArg("b", FixedType("User", [ ])),
                        ],
                        [ ],
                        Equality(
                            ModuleReference([ "a" ], Value("name")),
                            And(
                                ModuleReference([ "b" ], Value("name")),
                                Equality(
                                    ModuleReference([ "a" ], Value("age")),
                                    ModuleReference([ "b" ], Value("age"))
                                )
                            )
                        )
                    ),
                    Function(
                        "notEquals",
                        FixedType("boolean", [ ]),
                        [
                            FunctionArg("a", FixedType("User", [ ])),
                            FunctionArg("b", FixedType("User", [ ])),
                        ],
                        [ ],

                        IfStatement(
                            Equality(Value("a"), Value("b")),
                            Value("false"),
                            [ ],
                            [ ],
                            Value("true"),
                            [ ]
                        )
                    ),
                ]),
                Function(
                    "isSameUser",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("a", FixedType("User", [ ])),
                        FunctionArg("b", FixedType("User", [ ])),
                    ],
                    [ ],
                    FunctionCall("equals", [ Value("a"), Value("b") ])
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
                TypeAlias(FixedType("User", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),
                Typeclass(
                    "Eq",
                    [ GenericType("a") ],
                    [
                        TypeclassFunction("equals", FixedType("boolean", [ ]), [
                            GenericType("a"),
                            GenericType("a"),
                        ]),
                        TypeclassFunction(
                            "notEquals",
                            FixedType("boolean", [ ]),
                            [ GenericType("a"), GenericType("a") ]
                        ),
                    ]
                ),
                Impl("Eq", FixedType("User", [ ]), [
                    Function(
                        "equals",
                        FixedType("boolean", [ ]),
                        [
                            FunctionArg("a", FixedType("User", [ ])),
                            FunctionArg("b", FixedType("User", [ ])),
                        ],
                        [ ],
                        Equality(
                            ModuleReference([ "a" ], Value("name")),
                            And(
                                ModuleReference([ "b" ], Value("name")),
                                Equality(
                                    ModuleReference([ "a" ], Value("age")),
                                    ModuleReference([ "b" ], Value("age"))
                                )
                            )
                        )
                    ),
                    Function(
                        "notEquals",
                        FixedType("boolean", [ ]),
                        [
                            FunctionArg("a", FixedType("User", [ ])),
                            FunctionArg("b", FixedType("User", [ ])),
                        ],
                        [ ],

                        IfStatement(
                            Equality(Value("a"), Value("b")),
                            Value("false"),
                            [ ],
                            [ ],
                            Value("true"),
                            [ ]
                        )
                    ),
                ]),
                Function(
                    "isSameUser",
                    FixedType("boolean", [ ]),
                    [
                        FunctionArg("a", FixedType("User", [ ])),
                        FunctionArg("b", FixedType("User", [ ])),
                    ],
                    [ ],
                    FunctionCall("equals", [ Value("a"), Value("b") ])
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

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
