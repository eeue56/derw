import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";

type Empty = {
    kind: "Empty";
};

function Empty(): Empty {
    return {
        kind: "Empty",
    };
}

type InString = {
    kind: "InString";
};

function InString(): InString {
    return {
        kind: "InString",
    };
}

type InFormatString = {
    kind: "InFormatString";
};

function InFormatString(): InFormatString {
    return {
        kind: "InFormatString",
    };
}

type InBracket = {
    kind: "InBracket";
    depth: number;
};

function InBracket(depth: number): InBracket {
    return {
        kind: "InBracket",
        depth,
    };
}

type InSquareBracket = {
    kind: "InSquareBracket";
    depth: number;
};

function InSquareBracket(depth: number): InSquareBracket {
    return {
        kind: "InSquareBracket",
        depth,
    };
}

type InWhitespace = {
    kind: "InWhitespace";
};

function InWhitespace(): InWhitespace {
    return {
        kind: "InWhitespace",
    };
}

type Keyword = {
    kind: "Keyword";
};

function Keyword(): Keyword {
    return {
        kind: "Keyword",
    };
}

const keywords = [
    "if",
    "then",
    "else",
    "type",
    "alias",
    "import",
    "exposing",
    "as",
    "let",
    "in",
    "case",
    "of",
];

type State =
    | Empty
    | InString
    | InFormatString
    | InBracket
    | InSquareBracket
    | Keyword
    | InWhitespace;

export type StringToken = {
    kind: "StringToken";
    body: string;
};

export function StringToken(body: string): StringToken {
    return {
        kind: "StringToken",
        body,
    };
}

export type FormatStringToken = {
    kind: "FormatStringToken";
    body: string;
};

export function FormatStringToken(body: string): FormatStringToken {
    return {
        kind: "FormatStringToken",
        body,
    };
}

export type KeywordToken = {
    kind: "KeywordToken";
    body: string;
};

export function KeywordToken(body: string): KeywordToken {
    return {
        kind: "KeywordToken",
        body,
    };
}

export type IdentifierToken = {
    kind: "IdentifierToken";
    body: string;
};

export function IdentifierToken(body: string): IdentifierToken {
    return {
        kind: "IdentifierToken",
        body,
    };
}

export type LiteralToken = {
    kind: "LiteralToken";
    body: string;
};

export function LiteralToken(body: string): LiteralToken {
    return {
        kind: "LiteralToken",
        body,
    };
}

function isLiteral(body: string): boolean {
    if (body === "true" || body === "false") {
        return true;
    } else if (!isNaN(parseFloat(body))) {
        return true;
    }

    return false;
}

export type ColonToken = {
    kind: "ColonToken";
};

export function ColonToken(): ColonToken {
    return {
        kind: "ColonToken",
    };
}

export type ArrowToken = {
    kind: "ArrowToken";
};

export function ArrowToken(): ArrowToken {
    return {
        kind: "ArrowToken",
    };
}

export type CommentToken = {
    kind: "CommentToken";
};

export function CommentToken(): CommentToken {
    return {
        kind: "CommentToken",
    };
}

export type AssignToken = {
    kind: "AssignToken";
};

export function AssignToken(): AssignToken {
    return {
        kind: "AssignToken",
    };
}

export type CommaToken = {
    kind: "CommaToken";
};

export function CommaToken(): CommaToken {
    return {
        kind: "CommaToken",
    };
}

export type OpenCurlyBracesToken = {
    kind: "OpenCurlyBracesToken";
};

export function OpenCurlyBracesToken(): OpenCurlyBracesToken {
    return {
        kind: "OpenCurlyBracesToken",
    };
}

export type CloseCurlyBracesToken = {
    kind: "CloseCurlyBracesToken";
};

export function CloseCurlyBracesToken(): CloseCurlyBracesToken {
    return {
        kind: "CloseCurlyBracesToken",
    };
}

export type OpenBracketToken = {
    kind: "OpenBracketToken";
};

export function OpenBracketToken(): OpenBracketToken {
    return {
        kind: "OpenBracketToken",
    };
}

export type CloseBracketToken = {
    kind: "CloseBracketToken";
};

export function CloseBracketToken(): CloseBracketToken {
    return {
        kind: "CloseBracketToken",
    };
}

export type PipeToken = {
    kind: "PipeToken";
};

export function PipeToken(): PipeToken {
    return {
        kind: "PipeToken",
    };
}

export type OperatorToken = {
    kind: "OperatorToken";
    body: string;
};

export function OperatorToken(body: string): OperatorToken {
    return {
        kind: "OperatorToken",
        body,
    };
}

function isOperator(body: string): boolean {
    return (
        [
            "<",
            "<=",
            ">",
            ">=",
            "==",
            "!=",
            "-",
            "+",
            "*",
            "/",
            "|>",
            "<|",
            "&&",
            "||",
            "\\",
        ].indexOf(body) > -1
    );
}

export type WhitespaceToken = {
    kind: "WhitespaceToken";
    body: string;
};

export function WhitespaceToken(body: string): WhitespaceToken {
    return {
        kind: "WhitespaceToken",
        body,
    };
}

export type Token =
    | StringToken
    | FormatStringToken
    | KeywordToken
    | IdentifierToken
    | LiteralToken
    | ColonToken
    | ArrowToken
    | CommaToken
    | CommentToken
    | OperatorToken
    | AssignToken
    | OpenCurlyBracesToken
    | CloseCurlyBracesToken
    | OpenBracketToken
    | CloseBracketToken
    | PipeToken
    | WhitespaceToken;

function checkKeywordToken(currentToken: string, tokens: Token[]): void {
    if (currentToken === "=") {
        tokens.push(AssignToken());
    } else if (currentToken === "{") {
        tokens.push(OpenCurlyBracesToken());
    } else if (currentToken === "}") {
        tokens.push(CloseCurlyBracesToken());
    } else if (keywords.indexOf(currentToken) > -1) {
        tokens.push(KeywordToken(currentToken));
    } else if (currentToken === "--") {
        tokens.push(CommentToken());
    } else if (isLiteral(currentToken)) {
        tokens.push(LiteralToken(currentToken));
    } else if (isOperator(currentToken)) {
        tokens.push(OperatorToken(currentToken));
    } else {
        tokens.push(IdentifierToken(currentToken));
    }
}

export function tokenize(body: string): Token[] {
    let state: State = Empty();
    let currentToken = "";
    let tokens: Token[] = [ ];

    for (var i = 0; i < body.length; i++) {
        const char = body[i];
        const previousChar = i > 0 ? body[i - 1] : null;
        const isLast = i === body.length - 1;

        switch (state.kind) {
            case "InWhitespace":
            case "Empty": {
                if (char !== " " && char !== "\n" && currentToken.length > 0) {
                    tokens.push(WhitespaceToken(currentToken));
                    currentToken = "";
                    state = Empty();
                }
                switch (char) {
                    case '"': {
                        state = InString();
                        currentToken += char;
                        break;
                    }

                    case "`": {
                        state = InFormatString();
                        currentToken += char;
                        break;
                    }

                    case "(": {
                        state = InBracket(0);
                        tokens.push(OpenBracketToken());
                        break;
                    }

                    case ")": {
                        state = Empty();
                        tokens.push(CloseBracketToken());
                        break;
                    }

                    case "[": {
                        state = InSquareBracket(0);
                        currentToken += char;
                        break;
                    }

                    case "\n":
                    case " ": {
                        state = InWhitespace();
                        currentToken += char;
                        break;
                    }

                    case ":": {
                        tokens.push(ColonToken());
                        break;
                    }

                    case "-": {
                        if (body[i + 1] === ">") {
                            break;
                        }
                        state = Keyword();
                        currentToken += char;
                        break;
                    }

                    case ">": {
                        if (previousChar === "-") {
                            tokens.push(ArrowToken());
                            currentToken = "";
                            break;
                        } else if (previousChar === "|") {
                            tokens.push(OperatorToken("|>"));
                            currentToken = "";
                            break;
                        }

                        state = Keyword();
                        currentToken += char;
                        break;
                    }

                    case ",": {
                        tokens.push(CommaToken());
                        currentToken = "";
                        break;
                    }

                    case "|": {
                        if (body[i + 1] === ">" || body[i + 1] === "|") {
                            break;
                        } else if (previousChar === "|") {
                            tokens.push(OperatorToken("||"));
                            currentToken = "";
                            break;
                        }

                        tokens.push(PipeToken());
                        currentToken = "";
                        break;
                    }

                    case "\\": {
                        tokens.push(OperatorToken("\\"));
                        currentToken = "";
                        break;
                    }

                    default: {
                        state = Keyword();
                        currentToken += char;

                        if (isLast) {
                            checkKeywordToken(currentToken, tokens);
                        }

                        break;
                    }
                }

                break;
            }

            case "InString": {
                currentToken += char;
                if (char === '"') {
                    if (previousChar !== "\\") {
                        state = Empty();
                        tokens.push(StringToken(currentToken));
                        currentToken = "";
                    }
                }
                break;
            }

            case "InFormatString": {
                currentToken += char;
                if (char === "`") {
                    if (previousChar !== "\\") {
                        state = Empty();
                        tokens.push(FormatStringToken(currentToken));
                        currentToken = "";
                    }
                }
                break;
            }

            case "InBracket": {
                if (char === ")") {
                    if (state.depth === 0) {
                        state = Empty();

                        tokenize(currentToken).forEach((token) => {
                            tokens.push(token);
                        });

                        tokens.push(CloseBracketToken());

                        currentToken = "";
                        break;
                    } else {
                        state.depth--;
                    }
                } else if (char === "(") {
                    state.depth++;
                }
                currentToken += char;
                break;
            }

            case "InSquareBracket": {
                if (char === "]") {
                    if (state.depth === 0) {
                        state = Empty();
                        currentToken += char;
                        tokens.push(LiteralToken(currentToken));
                        currentToken = "";
                        break;
                    } else {
                        state.depth--;
                    }
                } else if (char === "[") {
                    state.depth++;
                }
                currentToken += char;
                break;
            }

            case "Keyword": {
                const isWhitespace = char === "\n" || char === " ";
                if (isWhitespace || isLast) {
                    if (char === ")") {
                        checkKeywordToken(currentToken, tokens);
                        tokens.push(CloseBracketToken());
                        currentToken = "";
                        state = Empty();
                        break;
                    }
                    if (isLast && !isWhitespace) {
                        currentToken += char;
                    }
                    checkKeywordToken(currentToken, tokens);
                    currentToken = "";

                    state = Empty();

                    if (isWhitespace) {
                        if (!isLast) {
                            currentToken += char;
                        } else {
                            tokens.push(WhitespaceToken(char));
                        }
                    }
                    break;
                } else if (char === ":") {
                    tokens.push(IdentifierToken(currentToken));
                    tokens.push(ColonToken());
                    currentToken = "";
                    state = Empty();
                    break;
                } else if (char === ",") {
                    tokens.push(IdentifierToken(currentToken));
                    tokens.push(CommaToken());
                    currentToken = "";
                    state = Empty();
                    break;
                } else if (char === "(") {
                    checkKeywordToken(currentToken, tokens);
                    tokens.push(OpenBracketToken());
                    currentToken = "";
                    state = Empty();
                    break;
                } else if (char === ")") {
                    tokens.push(IdentifierToken(currentToken));
                    tokens.push(CloseBracketToken());
                    currentToken = "";
                    state = Empty();
                    break;
                }
                currentToken += char;
            }
        }
    }

    return tokens;
}

function tokenToString(token: Token): string {
    switch (token.kind) {
        case "ArrowToken": {
            return "->";
        }
        case "AssignToken": {
            return "=";
        }
        case "CloseBracketToken": {
            return ")";
        }
        case "CloseCurlyBracesToken": {
            return "}";
        }
        case "ColonToken": {
            return ":";
        }
        case "CommaToken": {
            return ",";
        }
        case "CommentToken": {
            return "--";
        }
        case "FormatStringToken": {
            return token.body;
        }
        case "IdentifierToken": {
            return token.body;
        }
        case "KeywordToken": {
            return token.body;
        }
        case "LiteralToken": {
            return token.body;
        }
        case "OpenBracketToken": {
            return "(";
        }
        case "OpenCurlyBracesToken": {
            return "{";
        }
        case "OperatorToken": {
            return token.body;
        }
        case "PipeToken": {
            return "|";
        }
        case "StringToken": {
            return token.body;
        }
        case "WhitespaceToken": {
            return token.body;
        }
    }
}

export function tokensToString(tokens: Token[]): string {
    return tokens.map(tokenToString).join("");
}

export type BaseTypeToken = {
    kind: "BaseTypeToken";
    body: TypeToken[];
};

export function BaseTypeToken(body: TypeToken[]): BaseTypeToken {
    return {
        kind: "BaseTypeToken",
        body,
    };
}

export type FunctionTypeToken = {
    kind: "FunctionTypeToken";
    body: TypeToken[];
};

export function FunctionTypeToken(body: TypeToken[]): FunctionTypeToken {
    return {
        kind: "FunctionTypeToken",
        body,
    };
}

export type TypeToken =
    | IdentifierToken
    | ArrowToken
    | OpenBracketToken
    | CloseBracketToken
    | BaseTypeToken
    | FunctionTypeToken;

export type RootTypeTokens = BaseTypeToken | FunctionTypeToken;

export function tokenizeType(
    tokens: Token[]
): Result<string, RootTypeTokens[]> {
    const typeTokens: RootTypeTokens[] = [ ];
    let currentToken: TypeToken[] = [ ];
    let innerToken: TypeToken[] = [ ];
    let isInInner = false;
    let isInFunction = false;
    let wasInFunction = false;
    let bracketDepth = 0;

    for (const token of tokens) {
        switch (token.kind) {
            case "WhitespaceToken": {
                break;
            }

            case "OpenBracketToken": {
                bracketDepth++;
                if (currentToken.length === 0) {
                    isInFunction = true;
                } else {
                    isInInner = true;
                }
                break;
            }

            case "CloseBracketToken": {
                bracketDepth--;
                if (isInFunction) {
                    if (bracketDepth === 0) {
                        typeTokens.push(FunctionTypeToken(currentToken));
                        currentToken = [ ];
                        isInFunction = false;
                        wasInFunction = true;
                    } else {
                        currentToken.push(token);
                    }
                } else if (isInInner) {
                    if (bracketDepth === 0) {
                        currentToken.push(BaseTypeToken(innerToken));
                        innerToken = [ ];
                        isInInner = false;
                    } else {
                    }
                } else {
                    currentToken.push(token);
                }
                break;
            }

            case "IdentifierToken": {
                if (isInInner) {
                    innerToken.push(token);
                } else {
                    currentToken.push(token);
                }
                break;
            }

            case "ArrowToken": {
                if (isInFunction) {
                    currentToken.push(token);
                } else if (wasInFunction) {
                    wasInFunction = false;
                } else {
                    typeTokens.push(BaseTypeToken(currentToken));
                    currentToken = [ ];
                }
                break;
            }

            default: {
                return Err(`Unexpected ${token.kind} while parsing type.`);
            }
        }
    }

    if (currentToken.length > 0) {
        if (isInFunction) {
            return Err("Didn't find matching closing bracket parsing type.");
        }
        typeTokens.push(BaseTypeToken(currentToken));
    }

    return Ok(typeTokens);
}

function typeTokenToString(token: TypeToken): string {
    switch (token.kind) {
        case "ArrowToken": {
            return "->";
        }
        case "BaseTypeToken": {
            return rootTypeTokensToString([ token ]);
        }
        case "CloseBracketToken": {
            return ")";
        }
        case "FunctionTypeToken": {
            return rootTypeTokensToString([ token ]);
        }
        case "IdentifierToken": {
            return token.body;
        }
        case "OpenBracketToken": {
            return "(";
        }
    }
}

export function rootTypeTokensToString(tokens: RootTypeTokens[]): string {
    const output: string[] = [ ];
    let index = 0;
    for (const token of tokens) {
        switch (token.kind) {
            case "BaseTypeToken": {
                token.body.forEach((value) => {
                    if (value.kind === "BaseTypeToken") {
                        output.push(typeTokenToString(OpenBracketToken()));
                        value.body.forEach((v) =>
                            output.push(typeTokenToString(v))
                        );
                        output.push(typeTokenToString(CloseBracketToken()));
                    } else {
                        output.push(typeTokenToString(value));
                    }
                });
                break;
            }
            case "FunctionTypeToken": {
                output.push(typeTokenToString(OpenBracketToken()));
                token.body.forEach((value) => {
                    output.push(typeTokenToString(value));
                });
                output.push(typeTokenToString(CloseBracketToken()));
                break;
            }
        }
        if (index < tokens.length - 1) {
            output.push(typeTokenToString(ArrowToken()));
        }
        index++;
    }

    return output.join(" ");
}

export function nextNonWhitespace(tokens: Token[]): Token | null {
    for (const token of tokens) {
        if (token.kind !== "WhitespaceToken") return token;
    }

    return null;
}

function log(x: string): void {
    console.log(x);
    tokenize(x)
        .map((token) => {
            if ((token as any).body)
                return `${token.kind}("${(token as any).body}"),`;
            return `${token.kind}(),`;
        })
        .forEach((token) => {
            console.log(token);
        });
}
