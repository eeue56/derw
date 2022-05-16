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
    tokenize,
    tokenizeType,
    WhitespaceToken,
} from "../tokens";

export function testPlainFn() {
    const str = `( a -> b )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([ IdentifierToken("a") ]),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testPlainMap() {
    const str = `( a -> b ) -> a -> b`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("b"),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([ IdentifierToken("a") ]),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
            BaseTypeToken([ IdentifierToken("a") ]),
            BaseTypeToken([ IdentifierToken("b") ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testListMap() {
    const str = `( a -> b ) -> List a -> List b`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([ IdentifierToken("a") ]),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("a") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testSimpleNestedList() {
    const str = `List ( List a )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken("List"),
        WhitespaceToken(" "),
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        CloseBracketToken(),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([
                    IdentifierToken("List"),
                    BaseTypeToken([ IdentifierToken("a") ]),
                ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testNextedListMap() {
    const str = `( a -> b ) -> List ( List a ) -> List ( List b )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([ IdentifierToken("a") ]),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([
                    IdentifierToken("List"),
                    BaseTypeToken([ IdentifierToken("a") ]),
                ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([
                    IdentifierToken("List"),
                    BaseTypeToken([ IdentifierToken("b") ]),
                ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testListFilterMap() {
    const str = `( a -> Maybe b ) -> List a -> List b`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("Maybe"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([ IdentifierToken("a") ]),

                BaseTypeToken([
                    IdentifierToken("Maybe"),
                    BaseTypeToken([ IdentifierToken("b") ]),
                ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("a") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testListFilterMapWithSpaces() {
    const str = ` ( a -> Maybe b ) -> List a -> List b `;
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        WhitespaceToken(" "),
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("Maybe"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([ IdentifierToken("a") ]),

                BaseTypeToken([
                    IdentifierToken("Maybe"),
                    BaseTypeToken([ IdentifierToken("b") ]),
                ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("a") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testListFilterMapWithNesting() {
    const str = `( List a -> ( a -> Maybe b ) -> List b )`;

    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("Maybe"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
        WhitespaceToken(" "),
        CloseBracketToken(),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([
                    IdentifierToken("List"),
                    BaseTypeToken([ IdentifierToken("a") ]),
                ]),
                FunctionTypeToken([
                    BaseTypeToken([ IdentifierToken("a") ]),
                    BaseTypeToken([
                        IdentifierToken("Maybe"),
                        BaseTypeToken([ IdentifierToken("b") ]),
                    ]),
                ]),
                BaseTypeToken([
                    IdentifierToken("List"),
                    BaseTypeToken([ IdentifierToken("b") ]),
                ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testListFilterMapWithRow() {
    const str = `( Maybe Row -> boolean ) -> Maybe Row -> boolean`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("Maybe"),
        WhitespaceToken(" "),
        IdentifierToken("Row"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("boolean"),
        WhitespaceToken(" "),
        CloseBracketToken(),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("Maybe"),
        WhitespaceToken(" "),
        IdentifierToken("Row"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("boolean"),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            FunctionTypeToken([
                BaseTypeToken([
                    IdentifierToken("Maybe"),
                    BaseTypeToken([ IdentifierToken("Row") ]),
                ]),

                BaseTypeToken([ IdentifierToken("boolean") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("Maybe"),
                BaseTypeToken([ IdentifierToken("Row") ]),
            ]),
            BaseTypeToken([ IdentifierToken("boolean") ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testEither() {
    const str = `Either a b`;

    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken("Either"),
        WhitespaceToken(" "),
        IdentifierToken("a"),
        WhitespaceToken(" "),
        IdentifierToken("b"),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken([
                IdentifierToken("Either"),
                BaseTypeToken([ IdentifierToken("a") ]),
                BaseTypeToken([ IdentifierToken("b") ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str.trim());
}

export function testListToList() {
    const str = `List string -> List Person`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("string"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("List"),
        WhitespaceToken(" "),
        IdentifierToken("Person"),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("string") ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([ IdentifierToken("Person") ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}

export function testQualified() {
    const str = `Loop.RunningProgram model msg ( View msg )`.trim();
    const tokenized = tokenize(str);
    assert.deepStrictEqual(tokenized, [
        IdentifierToken("Loop.RunningProgram"),
        WhitespaceToken(" "),
        IdentifierToken("model"),
        WhitespaceToken(" "),
        IdentifierToken("msg"),
        WhitespaceToken(" "),
        OpenBracketToken(),
        WhitespaceToken(" "),
        IdentifierToken("View"),
        WhitespaceToken(" "),
        IdentifierToken("msg"),
        WhitespaceToken(" "),
        CloseBracketToken(),
    ]);

    const tokenizedType = tokenizeType(tokenized);
    assert.deepStrictEqual(
        tokenizedType,
        Ok([
            BaseTypeToken([
                IdentifierToken("Loop.RunningProgram"),
                BaseTypeToken([ IdentifierToken("model") ]),
                BaseTypeToken([ IdentifierToken("msg") ]),
                BaseTypeToken([
                    IdentifierToken("View"),
                    BaseTypeToken([ IdentifierToken("msg") ]),
                ]),
            ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}
