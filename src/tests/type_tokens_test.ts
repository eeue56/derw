import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import assert from "assert";
import {
    ArrowToken,
    BaseTypeToken,
    CloseBracketToken,
    FunctionTypeToken,
    IdentifierToken,
    OpenBracketToken,
    rootTypeTokensToString,
    StringToken,
    tokenize,
    tokenizeType,
    WhitespaceToken,
} from "../Tokens";

export function testPlainFn() {
    const str = `( a -> b )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testPlainMap() {
    const str = `( a -> b ) -> a -> b`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
            BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
            BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testListMap() {
    const str = `( a -> b ) -> List a -> List b`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testSimpleNestedList() {
    const str = `List ( List a )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "List" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "a" }) ],
                            }),
                        ],
                    }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testNextedListMap() {
    const str = `( a -> b ) -> List ( List a ) -> List ( List b )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "List" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "a" }) ],
                            }),
                        ],
                    }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "List" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "b" }) ],
                            }),
                        ],
                    }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testListFilterMap() {
    const str = `( a -> Maybe b ) -> List a -> List b`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Maybe" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),

                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "Maybe" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "b" }) ],
                            }),
                        ],
                    }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testListFilterMapWithSpaces() {
    const str = ` ( a -> Maybe b ) -> List a -> List b `;
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Maybe" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),

                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "Maybe" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "b" }) ],
                            }),
                        ],
                    }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testListFilterMapWithNesting() {
    const str = `( List a -> ( a -> Maybe b ) -> List b )`;

    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Maybe" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "List" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "a" }) ],
                            }),
                        ],
                    }),
                    FunctionTypeToken({
                        body: [
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "a" }) ],
                            }),
                            BaseTypeToken({
                                body: [
                                    IdentifierToken({ body: "Maybe" }),
                                    BaseTypeToken({
                                        body: [
                                            IdentifierToken({ body: "b" }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "List" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "b" }) ],
                            }),
                        ],
                    }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testListFilterMapWithRow() {
    const str = `( Maybe Row -> boolean ) -> Maybe Row -> boolean`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Maybe" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Row" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "boolean" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Maybe" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Row" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "boolean" }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken({
                body: [
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "Maybe" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "Row" }) ],
                            }),
                        ],
                    }),

                    BaseTypeToken({
                        body: [ IdentifierToken({ body: "boolean" }) ],
                    }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "Maybe" }),
                    BaseTypeToken({
                        body: [ IdentifierToken({ body: "Row" }) ],
                    }),
                ],
            }),
            BaseTypeToken({ body: [ IdentifierToken({ body: "boolean" }) ] }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testEither() {
    const str = `Either a b`;

    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken({ body: "Either" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "Either" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "b" }) ] }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testNestedEither() {
    const str = `Either a ( List b )`;

    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken({ body: "Either" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "a" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "b" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "Either" }),
                    BaseTypeToken({ body: [ IdentifierToken({ body: "a" }) ] }),
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "List" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "b" }) ],
                            }),
                        ],
                    }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testListToList() {
    const str = `List string -> List Person`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "string" }),
        WhitespaceToken({ body: " " }),
        ArrowToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "List" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "Person" }),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({
                        body: [ IdentifierToken({ body: "string" }) ],
                    }),
                ],
            }),
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "List" }),
                    BaseTypeToken({
                        body: [ IdentifierToken({ body: "Person" }) ],
                    }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testQualified() {
    const str = `Loop.RunningProgram model msg ( View msg )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken({ body: "Loop.RunningProgram" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "model" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "msg" }),
        WhitespaceToken({ body: " " }),
        OpenBracketToken({}),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "View" }),
        WhitespaceToken({ body: " " }),
        IdentifierToken({ body: "msg" }),
        WhitespaceToken({ body: " " }),
        CloseBracketToken({}),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken({
                body: [
                    IdentifierToken({ body: "Loop.RunningProgram" }),
                    BaseTypeToken({
                        body: [ IdentifierToken({ body: "model" }) ],
                    }),
                    BaseTypeToken({
                        body: [ IdentifierToken({ body: "msg" }) ],
                    }),
                    BaseTypeToken({
                        body: [
                            IdentifierToken({ body: "View" }),
                            BaseTypeToken({
                                body: [ IdentifierToken({ body: "msg" }) ],
                            }),
                        ],
                    }),
                ],
            }),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testString() {
    const str = `"hello"`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [ StringToken({ body: `"hello"` }) ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([ BaseTypeToken({ body: [ StringToken({ body: `"hello"` }) ] }) ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}
