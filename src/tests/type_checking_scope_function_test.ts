import * as assert from "@eeue56/ts-assert";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks } from "../Blocks";
import { parseBlock } from "../parser";
import { Nothing } from "../stdlib/Maybe";
import {
    Block,
    FixedType,
    GenericType,
    Import,
    ImportModule,
    Property,
    TypeAlias,
} from "../types";
import { getValuesInTopLevelScope, validateType } from "../type_checking";

export async function testEmptyList() {
    const exampleBlocksInScope = `
emptyList: List any
emptyList =
    [ ]
    `;

    const exampleInput = `
value: boolean -> List any
value a =
    emptyList
`.trim();
    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ], valuesInScope),
        Ok(FixedType("List", [ GenericType("any") ]))
    );
}

export async function testInvalidEmptyList() {
    const exampleBlocksInScope = `
emptyList: boolean
emptyList =
    true
    `;

    const exampleInput = `
value: boolean -> List any
value a =
    emptyList
`.trim();
    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ], valuesInScope),
        Err(
            "Expected `List (any)` but got `boolean` in the body of the function"
        )
    );
}

export async function testMissingEmptyList() {
    const exampleBlocksInScope = `
    `;

    const exampleInput = `
value: boolean -> List any
value a =
    emptyList
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(value, [ ], [ ], valuesInScope),
        Ok(FixedType("List", [ GenericType("any") ]))
    );
}

export async function testObjectLiteral() {
    const exampleBlocksInScope = `
name: string
name =
    "Noah"
    `;

    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: name,
        age: 28
    }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
            [ ],
            valuesInScope
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testInvalidObjectLiteral() {
    const exampleBlocksInScope = `
name: boolean
name =
    true
    `;

    const exampleInput = `
value: boolean -> Person
value a =
    {
        name: name,
        age: 28
    }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
            [ ],
            valuesInScope
        ),
        Err(
            "Mismatching type for type alias Person\nInvalid properties: name: Expected string but got boolean"
        )
    );
}

export async function testIfStatement() {
    const exampleBlocksInScope = `
name: string
name =
    "Noah"
    `;

    const exampleInput = `
value: boolean -> Person
value a =
    if a then
        {
            name: name,
            age: 28
        }
    else
        {
            name: "hm",
            age: 28
        }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
            [ ],
            valuesInScope
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testInvalidIfStatement() {
    const exampleBlocksInScope = `
name: boolean
name =
    true
    `;

    const exampleInput = `
value: boolean -> Person
value a =
    if a then
        {
            name: name,
            age: 28
        }
    else
        {
            name: "hm",
            age: 28
        }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
            [ ],
            valuesInScope
        ),
        Err("Conflicting types: { name: boolean, age: number }, Person")
    );
}

export async function testCaseStatement() {
    const exampleBlocksInScope = `
name: string
name =
    "Noah"
    `;

    const exampleInput = `
value: string -> Person
value a =
    case a of
        "" ->
            {
                name: name,
                age: 28
            }

        default ->
            {
                name: "hm",
                age: 28
            }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
            [ ],
            valuesInScope
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testInvalidCaseStatement() {
    const exampleBlocksInScope = `
name: boolean
name =
    true
    `;

    const exampleInput = `
value: string -> Person
value a =
    case a of
        "" ->
            {
                name: name,
                age: 28
            }

        default ->
            {
                name: "hm",
                age: 28
            }
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
            [ ],
            valuesInScope
        ),
        Err("Conflicting types: { name: boolean, age: number }, Person")
    );
}

export async function testModuleReference() {
    const exampleBlocksInScope = `
    `;

    const exampleInput = `
value: Parent -> Person
value person =
    person.person
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
                TypeAlias(FixedType("Parent", [ ]), [
                    Property("person", FixedType("Person", [ ])),
                ]),
            ],
            [ ],
            valuesInScope
        ),
        Ok(FixedType("Person", [ ]))
    );
}

export async function testInvalidModuleReference() {
    const exampleBlocksInScope = `
    `;

    const exampleInput = `
value: Parent -> Parent
value parent =
    parent.person
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
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
                TypeAlias(FixedType("Parent", [ ]), [
                    Property("person", FixedType("Person", [ ])),
                ]),
            ],
            [ ],
            valuesInScope
        ),
        Err("Expected `Parent` but got `Person` in the body of the function")
    );
}

export async function testImportedType() {
    const exampleBlocksInScope = `
    `;

    const exampleInput = `
getGenericTypes: Type -> List GenericType
getGenericTypes type_ =
    case type_ of
        GenericType ->
            [ type_ ]

        FunctionType ->
            getGenericTypesFromFunctionType type_

        FixedType { args } ->
            List.foldl (\\newType collection -> List.append collection (getGenericTypes newType)) [ ] args

        ObjectLiteralType ->
            [ ]
`.trim();

    const blocks = intoBlocks(exampleBlocksInScope);
    const parsedScope = blocks.map(parseBlock);
    assert.deepStrictEqual(
        parsedScope.filter((block) => block.kind === "Ok").length,
        parsedScope.length
    );
    const valuesInScope = getValuesInTopLevelScope(
        parsedScope.map((block) => (block as Ok<Block>).value)
    );

    const block = intoBlocks(exampleInput)[0];
    const parsed = parseBlock(block);
    assert.deepStrictEqual(parsed.kind, "Ok");

    const value = (parsed as Ok<Block>).value;
    assert.deepStrictEqual(
        validateType(
            value,
            [ ],
            [
                Import([
                    ImportModule(
                        "Types",
                        Nothing({}),
                        [ "GenericType", "Type" ],
                        "Global"
                    ),
                ]),
            ],
            valuesInScope
        ),
        Ok(FixedType("List", [ FixedType("GenericType", [ ]) ]))
    );
}
