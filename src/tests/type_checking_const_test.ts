import * as assert from "@eeue56/ts-assert";
import { Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseBlock } from "../parser";
import { validateType } from "../type_checking";
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
    UnionType,
    UnionUntaggedType,
    UnparsedBlock,
} from "../types";

export async function testEmptyList() {
    const exampleInput = `
value: List any
value = [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: List string
value = [ "hello", "world" ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: List number
value = [ 1, 2 ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: List number
value = [ 1..2 ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: string
value =
    "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testStringWithValidUntaggedUnionValue() {
    const exampleInput = `
value: Parens
value =
    "("
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: Parens
value =
    "invalid"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
            'Expected `Parens, composed of "(" | ")"` but got `invalid` in the body of the const'
        )
    );
}

export async function testFormatString() {
    const exampleInput = `
value: string
value =
    \`hello\`
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testObjectLiteral() {
    const exampleInput = `
value: Person
value =
    {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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

export async function testObjectLiteralWithBase() {
    const exampleInput = `
value: Person
value =
    {
        ...base,
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
        Ok(FixedType("Person", [ ]))
    );
}

export async function testValidObjectLiteral() {
    const exampleInput = `
value: Person
value =
    {
        name: "noah",
        age: 29
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
        Ok(FixedType("Person", [ ]))
    );
}

export async function testObjectLiteralAny() {
    const exampleInput = `
value: any
value =
    {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(GenericType("any"))
    );
}

export async function testObjectLiteralWithInvalidProperties() {
    const exampleInput = `
value: Person
value =
    {
        name: 28,
        age: "noah"
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
                "Invalid properties: name: Expected string but got number | age: Expected number but got string"
        )
    );
}

export async function testValidObjectLiteralWithGenericTypes() {
    const exampleInput = `
value: Person string number
value =
    {
        name: "noah",
        age: 29
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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

export async function testConstructor() {
    const exampleInput = `
value: Person
value =
    People {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("People", [
                        TagArg("name", FixedType("string", [ ])),
                        TagArg("age", FixedType("number", [ ])),
                    ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testConstructorWithMissingProperties() {
    const exampleInput = `
value: Person
value =
    People {
        name: "noah"
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("People", [
                        TagArg("name", FixedType("string", [ ])),
                        TagArg("age", FixedType("number", [ ])),
                    ]),
                ]),
            ],
            [ ]
        ),
        Err(
            "The tag People had these properties which are missing in this constructor object literal: age: number"
        )
    );
}

export async function testConstructorWithAdditionalProperties() {
    const exampleInput = `
value: Person
value =
    People {
        name: "noah",
        age: 29,
        animal: Dog
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("People", [
                        TagArg("name", FixedType("string", [ ])),
                        TagArg("age", FixedType("number", [ ])),
                    ]),
                ]),
                UnionType(FixedType("Animal", [ ]), [ Tag("Dog", [ ]) ]),
            ],
            [ ]
        ),
        Err(
            "The constructor object literal had these properties which aren't in the tag People: animal: Animal"
        )
    );
}

export async function testConstructorWithInvalidProperties() {
    const exampleInput = `
value: Person
value =
    People {
        name: 29,
        age: "noah"
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("People", [
                        TagArg("name", FixedType("string", [ ])),
                        TagArg("age", FixedType("number", [ ])),
                    ]),
                ]),
            ],
            [ ]
        ),
        Err(
            "Invalid properties: name: Expected string but got number | age: Expected number but got string"
        )
    );
}

export async function testConstructorWithTypeAliasOfSameName() {
    const exampleInput = `
value: People
value =
    People {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("People", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),
            ],
            [ ]
        ),
        Err(
            "Did not find constructor People in scope.\nPeople refers to a type alias, not a union type constructor."
        )
    );
}

export async function testConstructorWithGenericTypes() {
    const exampleInput = `
value: Person string number
value =
    People {
        name: "noah",
        age: 28
    }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(
                    FixedType("Person", [ GenericType("a"), GenericType("b") ]),
                    [
                        Tag("People", [
                            TagArg("name", GenericType("a")),
                            TagArg("age", GenericType("b")),
                        ]),
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

export async function testConstructorWithGenericTypesForNestedTypes() {
    const exampleInput = `
seenToCollision: Maybe Collision
seenToCollision =
    Just { value: {
        name: seen.name,
        indexes: seen.indexes
    } }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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

export async function testConstructorWithMultipleGenericTypesForNestedTypes() {
    const exampleInput = `
seenToCollision: Result string Collision
seenToCollision =
    Ok { value: {
        name: seen.name,
        indexes: seen.indexes
    } }
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(
                    FixedType("Result", [
                        GenericType("error"),
                        GenericType("result"),
                    ]),
                    [
                        Tag("Ok", [ TagArg("value", GenericType("result")) ]),
                        Tag("Err", [ TagArg("error", GenericType("error")) ]),
                    ]
                ),
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
        Ok(
            FixedType("Result", [
                FixedType("string", [ ]),
                FixedType("Collision", [ ]),
            ])
        )
    );
}

export async function testIfStatement() {
    const exampleInput = `
value: string
value =
    if true == true then
        "hello"
    else
        "world"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: any
value =
    if true then
        "hello"
    else
        1
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: string
value =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> "world"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiStatement() {
    const exampleInput = `
value: any
value =
    case x of
        Dog { name } -> "hello"
        Cat { name } -> 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err("Conflicting types: string, number")
    );
}

export async function testAddition() {
    const exampleInput = `
value: number
value =
    1 + 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: any
value =
    1 + "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Err(
            "Mismatching types between the left of the addition: number and the right of the addition: string\n" +
                "In Derw, types of both sides of an addition must be the same.\n" +
                "Try using a format string via `` instead\n" +
                "For example, `${1}hello`"
        )
    );
}

export async function testSubtraction() {
    const exampleInput = `
value: number
value =
    1 - 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: any
value =
    1 - "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: number
value =
    1 * 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: any
value =
    1 * "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: number
value =
    1 / 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: any
value =
    1 / "hello"
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: boolean
value =
    1 == 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: boolean
value =
    1 != 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: boolean
value =
    1 < 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: boolean
value =
    1 <= 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: boolean
value =
    1 > 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
value: boolean
value =
    1 >= 2
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testListPrepend() {
    const exampleInput = `
value: List number
value =
    1 :: []
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testListPrependWithValues() {
    const exampleInput = `
value: List string
value =
    "hello" :: [ "world" ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ]),
        Ok(FixedType("List", [ FixedType("string", [ ]) ]))
    );
}

export async function testListPrependWithConstructor() {
    const exampleInput = `
value: List People
value =
    Person { name: "hello" } :: [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("People", [ ]), [
                    Tag("Person", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("People", [ ]) ]))
    );
}

export async function testListPrependWithinCaseWithConstructor() {
    const exampleInput = `
value: List People
value =
    case "hello" of
        "hello" ->
            Person { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("People", [ ]), [
                    Tag("Person", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("People", [ ]) ]))
    );
}

export async function testListPrependWithinCaseWithNestedConstructor() {
    const exampleInput = `
value: List (Maybe People)
value =
    case "hello" of
        "hello" ->
            Just { value: { name: "hello" } } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("People", [ ]), [
                    Property("name", FixedType("string", [ ])),
                ]),
                UnionType(FixedType("Maybe", [ GenericType("a") ]), [
                    Tag("Just", [ TagArg("value", GenericType("a")) ]),
                ]),
            ],
            [ ]
        ),
        Ok(
            FixedType("List", [
                FixedType("Maybe", [ FixedType("People", [ ]) ]),
            ])
        )
    );
}

export async function testListPrependWithinCaseWithObjectLiteral() {
    const exampleInput = `
value: List Person
value =
    case "hello" of
        "hello" ->
            { name: "hello", age: 29 } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Alpha", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),
            ],

            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
    );
}

export async function testListPrependWithinCaseWithObjectLiteralAndMissingProperties() {
    const exampleInput = `
value: List Person
value =
    case "hello" of
        "hello" ->
            { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Alpha", [ ]), [
                    Property(
                        "indexes",
                        FixedType("List", [ FixedType("number", [ ]) ])
                    ),
                    Property("name", FixedType("string", [ ])),
                ]),
                TypeAlias(FixedType("Person", [ ]), [
                    Property("name", FixedType("string", [ ])),
                    Property("age", FixedType("number", [ ])),
                ]),
            ],

            [ ]
        ),
        Err(
            "Expected List (Person) but object literal type alias Person did not match the value due to:\n" +
                "The type alias had these properties which are missing in this object literal: age: number"
        )
    );
}

export async function testListPrependWithinCaseWithObjectLiteralAndAdditionalProperties() {
    const exampleInput = `
value: List Person
value =
    case "hello" of
        "hello" ->
            { name: "hello", age: 29, animal: true } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
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
            "Expected List (Person) but object literal type alias Person did not match the value due to:\n" +
                "The object literal had these properties which aren't in the type alias: animal: boolean"
        )
    );
}

export async function testListPrependWithinCaseWithConstructorAndMissingProperties() {
    const exampleInput = `
value: List Person
value =
    case "hello" of
        "hello" ->
            People { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("People", [
                        TagArg("name", FixedType("string", [ ])),
                        TagArg("age", FixedType("number", [ ])),
                    ]),
                ]),
            ],

            [ ]
        ),
        Err(
            "The tag People had these properties which are missing in this constructor object literal: age: number"
        )
    );
}

export async function testListPrependWithinCaseListWithConstructor() {
    const exampleInput = `
value: List People
value =
    case [ "hello" ] of
        "hello" :: [] ->
            Person { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("People", [ ]), [
                    Tag("Person", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("People", [ ]) ]))
    );
}

export async function testListPrependWithinCaseGeneralListWithConstructor() {
    const exampleInput = `
value: List Person
value =
    case [ "hello" ] of
        x :: [] ->
            Person { name: "hello" } :: [ ]
        default ->
            [ ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("Person", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
            ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
    );
}

export async function testListWithObjectLiteral() {
    const exampleInput = `
validators: List Validator
validators =
    [
        {
            blockKind: "Comment"
        },
        {
            blockKind: "MultilineComment"
        },
        {
            blockKind: "TypeAlias"
        },
        {
            blockKind: "UnionUntaggedType"
        },
        {
            blockKind: "UnionType"
        },
        {
            blockKind: "Indent"
        },
        {
            blockKind: "Import"
        },
        {
            blockKind: "Export"
        },
        {
            blockKind: "Function"
        },
        {
            blockKind: "Const"
        },
        {
            blockKind: "Definition"
        }
    ]
`.trim();
    const block = UnparsedBlock("ConstBlock", 0, exampleInput.split("\n"));
    const parsed = parseBlock(block);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [
                TypeAlias(FixedType("Validator", [ ]), [
                    Property("blockKind", FixedType("BlockKinds", [ ])),
                ]),
                TypeAlias(FixedType("IntoBlockInfo", [ ]), [
                    Property(
                        "currentBlock",
                        FixedType("List", [ FixedType("string", [ ]) ])
                    ),
                    Property("previousLine", FixedType("string", [ ])),
                    Property(
                        "currentBlockKind",
                        FixedType("Result", [
                            FixedType("string", [ ]),
                            FixedType("BlockKinds", [ ]),
                        ])
                    ),
                    Property("lineStart", FixedType("number", [ ])),
                ]),
            ],
            [
                Import([
                    ImportModule(
                        "./types",
                        Nothing(),
                        [ "BlockKinds" ],
                        "Global"
                    ),
                ]),
            ]
        ),
        Ok(FixedType("List", [ FixedType("Validator", [ ]) ]))
    );
}
