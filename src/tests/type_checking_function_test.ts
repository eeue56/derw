import * as assert from "@eeue56/ts-assert";
import { Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseBlock } from "../parser";
import {
    Block,
    FixedType,
    GenericType,
    Import,
    ImportModule,
    Property,
    StringValue,
    Tag,
    TagArg,
    TypeAlias,
    TypedBlock,
    UnionType,
    UnionUntaggedType,
    UnparsedBlock,
} from "../types";
import { validateType } from "../type_checking";

export async function testEmptyList() {
    const exampleInput = `
value: boolean -> List any
value a = [ ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ GenericType("any") ]))
    );
}

export async function testStringList() {
    const exampleInput = `
value: boolean -> List string
value a = [ "hello", "world" ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("string", [ ]) ]))
    );
}

export async function testNumberList() {
    const exampleInput = `
value: boolean -> List number
value a = [ 1, 2 ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testListRange() {
    const exampleInput = `
value: boolean -> List number
value a = [ 1..2 ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testString() {
    const exampleInput = `
value: List number -> string
value a =
    "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("List", Nothing(), [ "List" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("string", [ ]))
    );
}

export async function testFormatString() {
    const exampleInput = `
value: Result string string -> string
value a =
    \`hello\`
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Result", Nothing(), [ "Result" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("string", [ ]))
    );
}

export async function testStringWithValidUntaggedUnionValue() {
    const exampleInput = `
value: List number -> Parens
value a =
    "("
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionUntaggedType(FixedType("Parens", [ ]), [
                    StringValue("("),
                    StringValue(")"),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("Parens", [ ]))
    );
}

export async function testStringWithInvalidUntaggedUnionValue() {
    const exampleInput = `
value: List number -> Parens
value a =
    "invalid"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionUntaggedType(FixedType("Parens", [ ]), [
                    StringValue("("),
                    StringValue(")"),
                ]),
            ],
            [ ]
        ),
        Err(
            'Expected `Parens, composed of "(" | ")"` but got `invalid` in the body of the function'
        )
    );
}

export async function testObjectLiteral() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: "noah",
        age: 28
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Person", Nothing(), [ "Person" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testObjectLiteralWithAdditionalProperties() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: "noah",
        age: 28
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                ]),
            ],
            [ ]
        ),
        Err(
            "Mismatching type for type alias Person\n" +
                "The object literal had these properties which aren't in the type alias: age: number"
        )
    );
}

export async function testObjectLiteralWithMissingProperties() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: "noah"
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),
            ],
            [ ]
        ),
        Err(
            "Mismatching type for type alias Person\n" +
                "The type alias had these properties which are missing in this object literal: age: number"
        )
    );
}

export async function testObjectLiteralWithAdditionalAndMissingProperties() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        age: 28
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                ]),
            ],
            [ ]
        ),
        Err(
            "Mismatching type for type alias Person\n" +
                "The type alias had these properties which are missing in this object literal: name: string\n" +
                "The object literal had these properties which aren't in the type alias: age: number"
        )
    );
}

export async function testObjectLiteralWithValidUntaggedUnionValue() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: "(",
        age: 28
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("Parens", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),

                UnionUntaggedType(FixedType("Parens", [ ]), [
                    StringValue("("),
                    StringValue(")"),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testObjectLiteralWithInvalidUntaggedUnionValue() {
    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: "invalid",
        age: 28
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("Parens", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),

                UnionUntaggedType(FixedType("Parens", [ ]), [
                    StringValue("("),
                    StringValue(")"),
                ]),
            ],
            [ ]
        ),
        Err(
            "Mismatching type for type alias Person\n" +
                'Invalid properties: name: Expected Parens, composed of "(" | ")"` but got "invalid"'
        )
    );
}

export async function testObjectLiteralWithValidUntaggedUnionValueInCase() {
    const exampleInput = `
checkKeywordToken: string -> List Token
checkKeywordToken currentToken =
    case currentToken of
        "=" ->
            [ AssignToken ]

        "{-" ->
            [ MultilineCommentToken { body: "{-" } ]

        "-}" ->
            [ MultilineCommentToken { body: "-}" } ]
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Token", [ ]), [
                    Tag("AssignToken", [ ]),
                    Tag("MultilineCommentToken", [
                        TagArg("body", FixedType("Parens", [ ])),
                    ]),
                ]),
                UnionUntaggedType(FixedType("Parens", [ ]), [
                    StringValue("{-"),
                    StringValue("-}"),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Token", [ ]) ]))
    );
}

export async function testObjectLiteralWithInvalidUntaggedUnionValueInCase() {
    const exampleInput = `
checkKeywordToken: string -> List Token
checkKeywordToken currentToken =
    case currentToken of
        "=" ->
            [ AssignToken ]

        "{-" ->
            [ MultilineCommentToken { body: "invalid" } ]

        "-}" ->
            [ MultilineCommentToken { body: "-}" } ]
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Token", [ ]), [
                    Tag("AssignToken", [ ]),
                    Tag("MultilineCommentToken", [
                        TagArg("body", FixedType("Parens", [ ])),
                    ]),
                ]),
                UnionUntaggedType(FixedType("Parens", [ ]), [
                    StringValue("{-"),
                    StringValue("-}"),
                ]),
            ],
            [ ]
        ),
        Err(
            'Invalid properties: body: Expected Parens, composed of "{-" | "-}"` but got "invalid"'
        )
    );
}

export async function testObjectLiteralWithGenericTypes() {
    const exampleInput = `
value: boolean -> Person string number
value a =
    {
        name: "noah",
        age: 28
    }
`.trim();

    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(
                    FixedType("Person", [ GenericType("a"), GenericType("b") ]),
                    [
                        Property("name", GenericType("a")),
                        Property("age", GenericType("b")),
                    ]
                ),
            ],
            [ ]
        ),
        Ok(
            FixedType("Person", [
                FixedType("string", [ ]),
                FixedType("number", [ ]),
            ])
        )
    );
}

export async function testIfStatement() {
    const exampleInput = `
value: boolean -> string
value a =
    if true == a then
        "hello"
    else
        "world"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiIfStatement() {
    const exampleInput = `
value: any -> any
value a =
    if true then
        "hello"
    else
        1
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Conflicting types: string, number")
    );
}

export async function testCaseStatement() {
    const exampleInput = `
value: Animal -> string
value x =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> "world"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Animal", Nothing(), [ "Animal" ], "Global"),
                ]),
            ]
        ),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiStatement() {
    const exampleInput = `
value: Animal -> any
value x =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule("Animal", Nothing(), [ "Animal" ], "Global"),
                ]),
            ]
        ),
        Err("Conflicting types: string, number")
    );
}

export async function testAddition() {
    const exampleInput = `
value: boolean -> number
value a =
    1 + 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiAddition() {
    const exampleInput = `
value: boolean -> any
value a =
    1 + "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testSubtraction() {
    const exampleInput = `
value: boolean -> number
value a =
    1 - 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiSubtraction() {
    const exampleInput = `
value: boolean -> any
value a =
    1 - "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testMultiplication() {
    const exampleInput = `
value: a -> number
value a =
    1 * 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiMultiplication() {
    const exampleInput = `
value: boolean -> any
value a =
    1 * "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testDivision() {
    const exampleInput = `
value: boolean -> number
value a =
    1 / 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiDivision() {
    const exampleInput = `
value: boolean -> any
value a =
    1 / "hello"
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testEquality() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 == 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testInEquality() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 != 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testLessThan() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 < 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testLessThanOrEqual() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 <= 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testGreaterThan() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 > 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testGreaterThanOrEqual() {
    const exampleInput = `
value: boolean -> boolean
value a =
    1 >= 2
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testFunctionCallWithCaseAndInvalidObjectLiteralForConstructor() {
    const exampleType = `
type Maybe a =
    Just { value: a }
    | Nothing
`.trim();
    const exampleInput = `
value: boolean -> Maybe boolean
value x =
    if x == true then
        Just x
    else
        Nothing
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    const typeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        exampleType.split("\n")
    );
    const parsedType = parseBlock(typeBlock);

    assert.deepStrictEqual(parsed.kind, "Ok");
    assert.deepStrictEqual(parsedType.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ (parsedType as Ok<TypedBlock>).value ], [ ]),
        Err(
            "The tag Just had these properties which are missing in this constructor object literal: value: boolean"
        )
    );
}

export async function testFunctionCallWithCase() {
    const exampleType = `
type Maybe a =
    Just { value: a }
    | Nothing
`.trim();
    const exampleInput = `
value: boolean -> Maybe boolean
value x =
    if x == true then
        Just { value: x }
    else
        Nothing
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    const typeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        exampleType.split("\n")
    );
    const parsedType = parseBlock(typeBlock);

    assert.deepStrictEqual(parsed.kind, "Ok");
    assert.deepStrictEqual(parsedType.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ (parsedType as Ok<TypedBlock>).value ], [ ]),
        Ok(FixedType("Maybe", [ FixedType("boolean", [ ]) ]))
    );
}

export async function testFunctionCallWithCaseWithDifferentType() {
    const exampleType = `
type Maybe a =
    Just { value: a }
    | Nothing
`.trim();
    const exampleInput = `
value: string -> Maybe boolean
value x =
    if x == "hello" then
        Just { value: true }
    else
        Nothing
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    const typeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        exampleType.split("\n")
    );
    const parsedType = parseBlock(typeBlock);

    assert.deepStrictEqual(parsed.kind, "Ok");
    assert.deepStrictEqual(parsedType.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ (parsedType as Ok<TypedBlock>).value ], [ ]),
        Ok(FixedType("Maybe", [ FixedType("boolean", [ ]) ]))
    );
}

export async function testFunctionCallWithFnArg() {
    const exampleType = `
type Maybe a =
    Just { value: a }
    | Nothing
`.trim();

    const exampleInput = `
value: Maybe Row -> (Maybe Row -> boolean) -> boolean
value x fn =
    if fn x == Nothing then
        true
    else
        false
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    const typeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        exampleType.split("\n")
    );
    const parsedType = parseBlock(typeBlock);

    assert.deepStrictEqual(parsed.kind, "Ok");
    assert.deepStrictEqual(parsedType.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ (parsedType as Ok<TypedBlock>).value ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testFunctionCallWithFnTypeArg() {
    const exampleType = `
type Maybe a =
    Just { value: a }
    | Nothing
`.trim();

    const zipperType = `
type Zipper a = ZipperNode { head: a, previous: List a, next: List a }`.trim();

    const exampleInput = `
find: (a -> boolean) -> Zipper a -> Maybe (Zipper a)
find fn zipper =
    if fn zipper.head then
        Just { value: zipper }
    else
        case next zipper of
            Just { value } -> find fn value
            default -> Nothing
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    const typeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        exampleType.split("\n")
    );
    const parsedType = parseBlock(typeBlock);

    const zipperTypeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        zipperType.split("\n")
    );
    const parsedZipperType = parseBlock(zipperTypeBlock);

    assert.deepStrictEqual(parsed.kind, "Ok");
    assert.deepStrictEqual(parsedType.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                (parsedType as Ok<TypedBlock>).value,
                (parsedZipperType as Ok<TypedBlock>).value,
            ],
            [ ]
        ),
        Ok(FixedType("Maybe", [ FixedType("Zipper", [ GenericType("a") ]) ]))
    );
}

export async function testListPrependWithinCaseListWithConstructorWithTypeAlias() {
    const exampleInput = `
reduce: List string -> List Person
reduce xs =
    case xs of
        x :: [] ->
            Person { name: [ "hello" ] } :: reduce [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Person", [ ]), [
                    Property(
                        "name",
                        FixedType("List", [ FixedType("string", [ ]) ])
                    ),
                ]),
            ],
            [ ]
        ),
        Err(
            "Did not find constructor Person in scope.\n" +
                "Person refers to a type alias, not a union type constructor."
        )
    );
}

export async function testListPrependWithinCaseListWithConstructor() {
    const exampleInput = `
reduce: List string -> List People
reduce xs =
    case xs of
        x :: [] ->
            Person { name: [ "hello" ] } :: reduce [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("People", [ ]), [
                    Tag("Person", [
                        TagArg(
                            "name",
                            FixedType("List", [ FixedType("string", [ ]) ])
                        ),
                    ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("People", [ ]) ]))
    );
}

export async function testListPrependWithinCaseListWithUnionType() {
    const exampleInput = `
basic: List string -> List (Maybe string)
basic xs =
    case xs of
        anything :: [] ->
            Just { value: "hello" } :: basic [ ]

        default ->
            []
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Maybe", [ GenericType("a") ]), [
                    Tag("Just", [ TagArg("value", GenericType("a")) ]),
                    Tag("Nothing", [ ]),
                ]),
            ],
            [ ]
        ),
        Ok(
            FixedType("List", [
                FixedType("Maybe", [ FixedType("string", [ ]) ]),
            ])
        )
    );
}

export async function testMultipleTypeAliasesBeingCorrectlySelected() {
    const exampleInput = `
moduleNames: number -> ImportModule -> Names
moduleNames index module =
    let
        moduleName: string
        moduleName =
            case module.alias of
                Just { value } ->
                    value

                Nothing ->
                    module.name
    in
        {
            modules: [ {
            name: moduleName,
            indexes: [ index ]
        } ],
            values: List.map (\\name -> {
            indexes: [ index ],
            name: name
        }) module.exposing
        }
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Collision", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
                TypeAlias(FixedType("ImportModule", [ ]), [
                    Property(
                        "alias",
                        FixedType("Maybe", [ FixedType("string", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                    Property(
                        "exposing",
                        FixedType("List", [ FixedType("string", [ ]) ])
                    ),
                ]),
                TypeAlias(FixedType("Seen", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
                TypeAlias(FixedType("Names", [ ]), [
                    Property(
                        "modules",
                        FixedType("List", [ FixedType("Seen", [ ]) ])
                    ),
                    Property(
                        "values",
                        FixedType("List", [ FixedType("Seen", [ ]) ])
                    ),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("Names", [ ]))
    );
}

export async function testMultipleTypeAliasesWithImportBeingCorrectlySelected() {
    const exampleInput = `
moduleNames: number -> ImportModule -> Names
moduleNames index module =
    let
        moduleName: string
        moduleName =
            case module.alias of
                Just { value } ->
                    value

                Nothing ->
                    module.name
    in
        {
            modules: [ {
            name: moduleName,
            indexes: [ index ]
        } ],
            values: List.map (\\name -> {
            indexes: [ index ],
            name: name
        }) module.exposing
        }
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Seen", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
                TypeAlias(FixedType("Names", [ ]), [
                    Property(
                        "modules",
                        FixedType("List", [ FixedType("Seen", [ ]) ])
                    ),
                    Property(
                        "values",
                        FixedType("List", [ FixedType("Seen", [ ]) ])
                    ),
                ]),
            ],
            [
                Import([
                    ImportModule(
                        "./types",
                        Nothing(),
                        [ "ImportModule" ],
                        "Global"
                    ),
                ]),
            ]
        ),
        Ok(FixedType("Names", [ ]))
    );
}

export async function testConstructorWithGenericTypes() {
    const exampleType = `
type Maybe a =
    Just { value: a }
    | Nothing
`.trim();
    const exampleInput = `
seenToCollision: Seen -> Maybe Collision
seenToCollision seen =
    if seen.indexes.length > 1 then
        Just { value: {
            name: seen.name,
            indexes: seen.indexes
        } }
    else
        Nothing
`.trim();
    const block = UnparsedBlock("FunctionBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    const typeBlock = UnparsedBlock(
        "UnionTypeBlock",
        0,
        exampleType.split("\n")
    );
    const parsedType = parseBlock(typeBlock);

    assert.deepStrictEqual(parsed.kind, "Ok");
    assert.deepStrictEqual(parsedType.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                (parsedType as Ok<TypedBlock>).value,
                TypeAlias(FixedType("Seen", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
                TypeAlias(FixedType("Collision", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("Maybe", [ FixedType("Collision", [ ]) ]))
    );
}
