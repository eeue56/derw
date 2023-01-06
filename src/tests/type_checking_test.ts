import * as assert from "@eeue56/ts-assert";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseExpression } from "../parser";
import {
    Expression,
    FixedType,
    GenericType,
    ObjectLiteralType,
    Property,
    Tag,
    TagArg,
    Type,
    TypeAlias,
    UnionType,
} from "../types";
import { findReplacement, inferType } from "../type_checking";

export async function testEmptyList() {
    const exampleInput = `
[ ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("any", [ ]) ]),
            [ ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("any", [ ]) ]))
    );
}

export async function testStringList() {
    const exampleInput = `
[ "hello", "world" ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("string", [ ]) ]),
            [ ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("string", [ ]) ]))
    );
}

export async function testNumberList() {
    const exampleInput = `
[ 1, 2 ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("number", [ ]) ]),
            [ ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testListRange() {
    const exampleInput = `
[ 1..2 ]
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("number", [ ]) ]),
            [ ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testString() {
    const exampleInput = `
"hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("string", [ ]), [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testFormatString() {
    const exampleInput = `
\`hello\`
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("string", [ ]), [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testObjectLiteral() {
    const exampleInput = `
{
    name: "noah",
    age: 28
}
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            ObjectLiteralType({
                name: FixedType("string", [ ]),
                age: FixedType("number", [ ]),
            }),
            [ ],
            [ ]
        ),
        Ok(
            ObjectLiteralType({
                name: FixedType("string", [ ]),
                age: FixedType("number", [ ]),
            })
        )
    );
}

export async function testIfStatement() {
    const exampleInput = `
if true then
    "hello"
else
    "world"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("string", [ ]), [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiIfStatement() {
    const exampleInput = `
if true then
    "hello"
else
    1
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("string", [ ]), [ ], [ ]),
        Err("Conflicting types: string, number")
    );
}

export async function testCaseStatement() {
    const exampleInput = `
case x of
    Dog { name } -> "hello"
    Cat { name } -> "world"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("string", [ ]), [ ], [ ]),
        Ok(FixedType("string", [ ]))
    );
}

export async function testMultiStatement() {
    const exampleInput = `
case x of
    Dog { name } -> "hello"
    Cat { name } -> 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("string", [ ]), [ ], [ ]),
        Err("Conflicting types: string, number")
    );
}

export async function testAddition() {
    const exampleInput = `
1 + 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiAddition() {
    const exampleInput = `
1 + "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testSubtraction() {
    const exampleInput = `
1 - 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiSubtraction() {
    const exampleInput = `
1 - "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testMultiplication() {
    const exampleInput = `
1 * 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiMultiplication() {
    const exampleInput = `
1 * "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testDivision() {
    const exampleInput = `
1 / 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Ok(FixedType("number", [ ]))
    );
}

export async function testMultiDivision() {
    const exampleInput = `
1 / "hello"
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ]),
        Err("Mismatching types between number and string")
    );
}

export async function testEquality() {
    const exampleInput = `
1 == 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("boolean", [ ]), [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testInEquality() {
    const exampleInput = `
1 != 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("boolean", [ ]), [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testLessThan() {
    const exampleInput = `
1 < 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("boolean", [ ]), [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testLessThanOrEqual() {
    const exampleInput = `
1 <= 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("boolean", [ ]), [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testGreaterThan() {
    const exampleInput = `
1 > 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("boolean", [ ]), [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testGreaterThanOrEqual() {
    const exampleInput = `
1 >= 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("boolean", [ ]), [ ], [ ]),
        Ok(FixedType("boolean", [ ]))
    );
}

export async function testListPrepend() {
    const exampleInput = `
1 :: 2 :: [ ]
`.trim();
    const parsed = parseExpression(exampleInput);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("number", [ ]) ]),
            [ ],
            [ ]
        ),
        Ok(FixedType("List", [ FixedType("number", [ ]) ]))
    );
}

export async function testListPrependWithMixedTypes() {
    const exampleInput = `
1 :: "hello" :: [ ]
`.trim();
    const parsed = parseExpression(exampleInput);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("number", [ ]) ]),
            [ ],
            [ ]
        ),
        Err(
            "Invalid types in :: - lefthand (number) must match elements of righthand (string)"
        )
    );
}

export async function testListPrependMismatchingConstructor() {
    const exampleInput = `
Person { name: "hello" } :: [ Animal { name: "Frodo" } ]
`.trim();
    const parsed = parseExpression(exampleInput);

    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(
            value,
            FixedType("List", [ FixedType("Person", [ ]) ]),
            [
                UnionType(FixedType("Person", [ ]), [
                    Tag("Person", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
                UnionType(FixedType("Animal", [ ]), [
                    Tag("Animal", [ TagArg("name", FixedType("string", [ ])) ]),
                ]),
            ],
            [ ]
        ),
        Err(
            "Invalid types in :: - lefthand (Person) must match elements of righthand (Animal)"
        )
    );
}

function unifyTag(expectedType: Type, unionType: UnionType, tag: Tag): Tag {
    if (expectedType.kind !== "FixedType") return tag;

    const outputTypeArgs: Type[] = [ ];

    for (var i = 0; i < expectedType.args.length; i++) {
        const expectedArg = expectedType.args[i];
        const unionTypeArg = unionType.type.args[i];
        if (expectedArg.kind !== "GenericType") {
            outputTypeArgs.push(expectedArg);
        } else {
            outputTypeArgs.push(unionTypeArg);
        }
    }

    return tag;
}

export async function testComparingObjectLiteralTypeWithGenerics() {
    const expectedType = FixedType("Maybe", [ FixedType("number", [ ]) ]);
    const genericType = UnionType(FixedType("Maybe", [ GenericType("a") ]), [
        Tag("Just", [ TagArg("value", GenericType("a")) ]),
        Tag("Nothing", [ ]),
    ]);
    const qualifiedType = UnionType(
        FixedType("Maybe", [ FixedType("number", [ ]) ]),
        [
            Tag("Just", [ TagArg("value", FixedType("number", [ ])) ]),
            Tag("Nothing", [ ]),
        ]
    );
}

export function testUnifyingOfObjectLiteralType() {
    // validateObjectLiteralType()
}

export function testFindReplacement() {
    const expectedType = FixedType("Maybe", [ FixedType("Collision", [ ]) ]);
    const inferredType = FixedType("Maybe", [ FixedType("Collision", [ ]) ]);
    const replacement = findReplacement(inferredType, expectedType, [
        TypeAlias(FixedType("Collision", [ ]), [
            Property(
                "indexes",
                FixedType("List", [ FixedType("number", [ ]) ])
            ),
            Property("name", FixedType("string", [ ])),
        ]),
    ]);

    assert.deepStrictEqual(replacement, expectedType);
}

export function testFindReplacementObjectLiteralType() {
    const expectedType = FixedType("Maybe", [ FixedType("Collision", [ ]) ]);
    const inferredType = FixedType("Maybe", [
        ObjectLiteralType({
            name: FixedType("any", [ ]),
            indexes: FixedType("any", [ ]),
        }),
    ]);
    const replacement = findReplacement(inferredType, expectedType, [
        TypeAlias(FixedType("Collision", [ ]), [
            Property(
                "indexes",
                FixedType("List", [ FixedType("number", [ ]) ])
            ),
            Property("name", FixedType("string", [ ])),
        ]),
    ]);

    assert.deepStrictEqual(replacement, expectedType);
}
