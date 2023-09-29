import * as assert from "@eeue56/ts-assert";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { parseExpression } from "../parser";
import { findReplacement, inferType } from "../type_checking";
import {
    Expression,
    FixedType,
    ObjectLiteralType,
    Property,
    Tag,
    TagArg,
    TypeAlias,
    UnionType,
} from "../types";

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
            [ ],
            {}
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
            [ ],
            {}
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
            [ ],
            {}
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
            [ ],
            {}
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
        inferType(value, FixedType("string", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("string", [ ]), [ ], [ ], {}),
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
            [ ],
            {}
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
        inferType(value, FixedType("string", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("string", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("string", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("string", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
1 - 2
`;
    const parsed = parseExpression(exampleInput);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Expression>).value;
    assert.deepStrictEqual(
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("number", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("boolean", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("boolean", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("boolean", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("boolean", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("boolean", [ ]), [ ], [ ], {}),
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
        inferType(value, FixedType("boolean", [ ]), [ ], [ ], {}),
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
            [ ],
            {}
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
            [ ],
            {}
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
            [ ],
            {}
        ),
        Err(
            "Invalid types in :: - lefthand (Person) must match elements of righthand (Animal)"
        )
    );
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
