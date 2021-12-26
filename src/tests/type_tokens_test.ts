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
                IdentifierToken("a"),
                ArrowToken(),
                IdentifierToken("b"),
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
                IdentifierToken("a"),
                ArrowToken(),
                IdentifierToken("b"),
            ]),
            BaseTypeToken([ IdentifierToken("List"), IdentifierToken("a") ]),
            BaseTypeToken([ IdentifierToken("List"), IdentifierToken("b") ]),
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
                IdentifierToken("a"),
                ArrowToken(),
                IdentifierToken("b"),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([
                    IdentifierToken("List"),
                    IdentifierToken("a"),
                ]),
            ]),
            BaseTypeToken([
                IdentifierToken("List"),
                BaseTypeToken([
                    IdentifierToken("List"),
                    IdentifierToken("b"),
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
                IdentifierToken("a"),
                ArrowToken(),
                IdentifierToken("Maybe"),
                IdentifierToken("b"),
            ]),
            BaseTypeToken([ IdentifierToken("List"), IdentifierToken("a") ]),
            BaseTypeToken([ IdentifierToken("List"), IdentifierToken("b") ]),
        ])
    );

    const rootTypeString = rootTypeTokensToString((tokenizedType as any).value);
    assert.deepStrictEqual(rootTypeString, str);
}
