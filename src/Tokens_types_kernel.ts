import {
    ArrowToken,
    CloseBracketToken,
    IdentifierToken,
    OpenBracketToken,
    StringToken,
} from "./Tokens_derw";

export type TypeTokenRaw =
    | IdentifierToken
    | ArrowToken
    | OpenBracketToken
    | CloseBracketToken
    | StringToken;

export type TypeToken =
    | IdentifierToken
    | ArrowToken
    | OpenBracketToken
    | CloseBracketToken
    | StringToken
    | BaseTypeToken
    | FunctionTypeToken;

export type BaseTypeToken = {
    kind: "BaseTypeToken";
    body: TypeToken[];
};

export function BaseTypeToken(args: { body: TypeToken[] }): BaseTypeToken {
    return {
        kind: "BaseTypeToken",
        ...args,
    };
}

export type FunctionTypeToken = {
    kind: "FunctionTypeToken";
    body: TypeToken[];
};

export function FunctionTypeToken(args: {
    body: TypeToken[];
}): FunctionTypeToken {
    return {
        kind: "FunctionTypeToken",
        ...args,
    };
}

export type RootTypeTokens = BaseTypeToken | FunctionTypeToken;
