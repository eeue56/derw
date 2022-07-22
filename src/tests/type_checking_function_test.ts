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
    Tag,
    TagArg,
    TypeAlias,
    TypedBlock,
    UnionType,
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

export async function testListPrependWithinCaseListWithConstructor() {
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
        Ok(FixedType("List", [ FixedType("Person", [ ]) ]))
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
