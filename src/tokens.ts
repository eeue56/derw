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
];

type State =
    | Empty
    | InString
    | InFormatString
    | InBracket
    | InSquareBracket
    | Keyword;

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
        ].indexOf(body) > -1
    );
}

type Token =
    | StringToken
    | FormatStringToken
    | KeywordToken
    | IdentifierToken
    | LiteralToken
    | ColonToken
    | ArrowToken
    | CommaToken
    | OperatorToken
    | AssignToken
    | OpenCurlyBracesToken
    | CloseCurlyBracesToken
    | OpenBracketToken
    | CloseBracketToken
    | PipeToken;

function checkKeywordToken(currentToken: string, tokens: Token[]): void {
    if (currentToken === "=") {
        tokens.push(AssignToken());
    } else if (currentToken === "{") {
        tokens.push(OpenCurlyBracesToken());
    } else if (currentToken === "}") {
        tokens.push(CloseCurlyBracesToken());
    } else if (keywords.indexOf(currentToken) > -1) {
        tokens.push(KeywordToken(currentToken));
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
            case "Empty": {
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

                    case "[": {
                        state = InSquareBracket(0);
                        currentToken += char;
                        break;
                    }

                    case "\n":
                    case " ": {
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
                if (char === "\n" || char === " " || isLast) {
                    if (isLast && char !== "\n" && char !== "\n") {
                        currentToken += char;
                    }

                    checkKeywordToken(currentToken, tokens);
                    currentToken = "";

                    state = Empty();
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
                }
                currentToken += char;
            }
        }
    }

    return tokens;
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
