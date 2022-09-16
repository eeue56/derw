import { TypeTokenRaw, TypeToken, BaseTypeToken, FunctionTypeToken, RootTypeTokens } from "./Tokens_types_kernel";

import * as List from "./stdlib/List";

export { StringToken };
export { FormatStringToken };
export { KeywordToken };
export { IdentifierToken };
export { LiteralToken };
export { ColonToken };
export { ArrowToken };
export { CommentToken };
export { MultilineCommentToken };
export { AssignToken };
export { CommaToken };
export { OpenCurlyBracesToken };
export { CloseCurlyBracesToken };
export { OpenBracketToken };
export { CloseBracketToken };
export { PipeToken };
export { OperatorToken };
export { WhitespaceToken };
export { Token };

export { RootTypeTokens };
export { BaseTypeToken };
export { FunctionTypeToken };

export { checkKeywordToken };
export { tokenize };
export { tokenizeType };
export { rootTypeTokensToString };

type Empty = {
    kind: "Empty";
};

function Empty(args: {}): Empty {
    return {
        kind: "Empty",
        ...args,
    };
}

type InString = {
    kind: "InString";
};

function InString(args: {}): InString {
    return {
        kind: "InString",
        ...args,
    };
}

type InFormatString = {
    kind: "InFormatString";
};

function InFormatString(args: {}): InFormatString {
    return {
        kind: "InFormatString",
        ...args,
    };
}

type InBracket = {
    kind: "InBracket";
    depth: number;
};

function InBracket(args: { depth: number }): InBracket {
    return {
        kind: "InBracket",
        ...args,
    };
}

type InSquareBracket = {
    kind: "InSquareBracket";
    depth: number;
};

function InSquareBracket(args: { depth: number }): InSquareBracket {
    return {
        kind: "InSquareBracket",
        ...args,
    };
}

type InWhitespace = {
    kind: "InWhitespace";
};

function InWhitespace(args: {}): InWhitespace {
    return {
        kind: "InWhitespace",
        ...args,
    };
}

type Keyword = {
    kind: "Keyword";
};

function Keyword(args: {}): Keyword {
    return {
        kind: "Keyword",
        ...args,
    };
}

type State = Empty | InString | InFormatString | InBracket | InSquareBracket | InWhitespace | Keyword;

const keywords: string[] = [ "if", "then", "else", "type", "alias", "import", "exposing", "as", "let", "in", "case", "of", "do", "return" ];

type MultilineCommentBody = "{-" | "-}";

type StringToken = {
    kind: "StringToken";
    body: string;
};

function StringToken(args: { body: string }): StringToken {
    return {
        kind: "StringToken",
        ...args,
    };
}

type FormatStringToken = {
    kind: "FormatStringToken";
    body: string;
};

function FormatStringToken(args: { body: string }): FormatStringToken {
    return {
        kind: "FormatStringToken",
        ...args,
    };
}

type KeywordToken = {
    kind: "KeywordToken";
    body: string;
};

function KeywordToken(args: { body: string }): KeywordToken {
    return {
        kind: "KeywordToken",
        ...args,
    };
}

type IdentifierToken = {
    kind: "IdentifierToken";
    body: string;
};

function IdentifierToken(args: { body: string }): IdentifierToken {
    return {
        kind: "IdentifierToken",
        ...args,
    };
}

type LiteralToken = {
    kind: "LiteralToken";
    body: string;
};

function LiteralToken(args: { body: string }): LiteralToken {
    return {
        kind: "LiteralToken",
        ...args,
    };
}

type ColonToken = {
    kind: "ColonToken";
};

function ColonToken(args: {}): ColonToken {
    return {
        kind: "ColonToken",
        ...args,
    };
}

type ArrowToken = {
    kind: "ArrowToken";
};

function ArrowToken(args: {}): ArrowToken {
    return {
        kind: "ArrowToken",
        ...args,
    };
}

type CommentToken = {
    kind: "CommentToken";
};

function CommentToken(args: {}): CommentToken {
    return {
        kind: "CommentToken",
        ...args,
    };
}

type MultilineCommentToken = {
    kind: "MultilineCommentToken";
    body: MultilineCommentBody;
};

function MultilineCommentToken(args: { body: MultilineCommentBody }): MultilineCommentToken {
    return {
        kind: "MultilineCommentToken",
        ...args,
    };
}

type AssignToken = {
    kind: "AssignToken";
};

function AssignToken(args: {}): AssignToken {
    return {
        kind: "AssignToken",
        ...args,
    };
}

type CommaToken = {
    kind: "CommaToken";
};

function CommaToken(args: {}): CommaToken {
    return {
        kind: "CommaToken",
        ...args,
    };
}

type OpenCurlyBracesToken = {
    kind: "OpenCurlyBracesToken";
};

function OpenCurlyBracesToken(args: {}): OpenCurlyBracesToken {
    return {
        kind: "OpenCurlyBracesToken",
        ...args,
    };
}

type CloseCurlyBracesToken = {
    kind: "CloseCurlyBracesToken";
};

function CloseCurlyBracesToken(args: {}): CloseCurlyBracesToken {
    return {
        kind: "CloseCurlyBracesToken",
        ...args,
    };
}

type OpenBracketToken = {
    kind: "OpenBracketToken";
};

function OpenBracketToken(args: {}): OpenBracketToken {
    return {
        kind: "OpenBracketToken",
        ...args,
    };
}

type CloseBracketToken = {
    kind: "CloseBracketToken";
};

function CloseBracketToken(args: {}): CloseBracketToken {
    return {
        kind: "CloseBracketToken",
        ...args,
    };
}

type PipeToken = {
    kind: "PipeToken";
};

function PipeToken(args: {}): PipeToken {
    return {
        kind: "PipeToken",
        ...args,
    };
}

type OperatorToken = {
    kind: "OperatorToken";
    body: string;
};

function OperatorToken(args: { body: string }): OperatorToken {
    return {
        kind: "OperatorToken",
        ...args,
    };
}

type WhitespaceToken = {
    kind: "WhitespaceToken";
    body: string;
};

function WhitespaceToken(args: { body: string }): WhitespaceToken {
    return {
        kind: "WhitespaceToken",
        ...args,
    };
}

type Token = StringToken | FormatStringToken | KeywordToken | IdentifierToken | LiteralToken | ColonToken | ArrowToken | CommentToken | MultilineCommentToken | AssignToken | CommaToken | OpenCurlyBracesToken | CloseCurlyBracesToken | OpenBracketToken | CloseBracketToken | PipeToken | OperatorToken | WhitespaceToken;

function isLiteral(body: string): boolean {
    if (body === "true" || body === "false") {
        return true;
    } else {
        if (isNaN(parseFloat(body))) {
            return false;
        } else {
            return true;
        };
    }
}

const operators: string[] = [ "<", "<=", ">", ">=", "==", "!=", "-", "+", "*", "/", "%", "|>", "<|", "&&", "||" ];

function isOperator(body: string): boolean {
    if (operators.indexOf(body) === -1) {
        return false;
    } else {
        return true;
    }
}

function checkKeywordToken(currentToken: string): Token[] {
    switch (currentToken) {
        case "=": {
            return [ AssignToken({ }) ];
        }
        case "{": {
            return [ OpenCurlyBracesToken({ }) ];
        }
        case "}": {
            return [ CloseCurlyBracesToken({ }) ];
        }
        case "{}": {
            return [ OpenCurlyBracesToken({ }), CloseCurlyBracesToken({ }) ];
        }
        case "--": {
            return [ CommentToken({ }) ];
        }
        case "{-": {
            return [ MultilineCommentToken({ body: "{-" }) ];
        }
        case "-}": {
            return [ MultilineCommentToken({ body: "-}" }) ];
        }
        default: {
            if (keywords.indexOf(currentToken) > -1) {
                return [ KeywordToken({ body: currentToken }) ];
            } else {
                if (isLiteral(currentToken)) {
                    return [ LiteralToken({ body: currentToken }) ];
                } else {
                    if (isOperator(currentToken)) {
                        return [ OperatorToken({ body: currentToken }) ];
                    } else {
                        return [ IdentifierToken({ body: currentToken }) ];
                    };
                };
            };
        }
    }
}

type TokenizeInfo = {
    state: State;
    currentToken: string;
    tokens: Token[];
    body: string;
    index: number;
}

function TokenizeInfo(args: { state: State, currentToken: string, tokens: Token[], body: string, index: number }): TokenizeInfo {
    return {
        ...args,
    };
}

function isEscape(char: string): boolean {
    return char.charCodeAt(0) === 92;
}

function not(a: boolean): boolean {
    if (a) {
        return false;
    } else {
        return true;
    }
}

function tokenizeHelpInWhitespaceOrEmpty(initialInfo: TokenizeInfo): TokenizeInfo {
    const char: string = initialInfo.body[initialInfo.index];
    const info: TokenizeInfo = char !== " " && char !== "\n" && initialInfo.currentToken.length > 0 ? {
        ...initialInfo,
        currentToken: "",
        state: Empty({ }),
        tokens: List.append(initialInfo.tokens, [ WhitespaceToken({ body: initialInfo.currentToken }) ])
    } : initialInfo;
    const previousChar: string = info.index === 0 ? "" : info.body[info.index - 1];
    const isLast: boolean = info.body.length - 1 === info.index;
    const nextInfo: TokenizeInfo = (function (): any {
        switch (char) {
            case `"`: {
                return {
                ...info,
                state: InString({ }),
                currentToken: info.currentToken + char
            };
            }
            case "`": {
                return {
                ...info,
                state: InFormatString({ }),
                currentToken: info.currentToken + char
            };
            }
            case "(": {
                return {
                ...info,
                state: InBracket({ depth: 0 }),
                tokens: List.append(info.tokens, [ OpenBracketToken({ }) ])
            };
            }
            case ")": {
                return {
                ...info,
                state: Empty({ }),
                tokens: List.append(info.tokens, [ CloseBracketToken({ }) ])
            };
            }
            case "[": {
                return {
                ...info,
                state: InSquareBracket({ depth: 0 }),
                currentToken: info.currentToken + char
            };
            }
            case "\n": {
                return {
                ...info,
                state: InWhitespace({ }),
                currentToken: info.currentToken + char
            };
            }
            case " ": {
                return {
                ...info,
                state: InWhitespace({ }),
                currentToken: info.currentToken + char
            };
            }
            case ":": {
                if (info.body[info.index + 1] === ":") {
                    const token: Token = OperatorToken({ body: "::" });
                    return {
                        ...info,
                        tokens: List.append(info.tokens, [ token ]),
                        index: info.index + 1
                    };
                } else {
                    return { ...info, tokens: List.append(info.tokens, [ ColonToken({ }) ]) };
                };
            }
            case "-": {
                if (info.body[info.index + 1] === ">") {
                    return info;
                } else {
                    return {
                        ...info,
                        state: Keyword({ }),
                        currentToken: info.currentToken + char
                    };
                };
            }
            case ">": {
                switch (previousChar) {
                    case "-": {
                        return {
                        ...info,
                        tokens: List.append(info.tokens, [ ArrowToken({ }) ]),
                        currentToken: ""
                    };
                    }
                    case "|": {
                        return {
                        ...info,
                        tokens: List.append(info.tokens, [ OperatorToken({ body: "|>" }) ]),
                        currentToken: ""
                    };
                    }
                    default: {
                        return {
                        ...info,
                        state: Keyword({ }),
                        currentToken: info.currentToken + char
                    };
                    }
                };
            }
            case ",": {
                return { ...info, tokens: List.append(info.tokens, [ CommaToken({ }) ]) };
            }
            case "|": {
                if (info.body[info.index + 1] === ">" || info.body[info.index + 1] === "|") {
                    return info;
                } else {
                    if (previousChar === "|") {
                        return {
                            ...info,
                            tokens: List.append(info.tokens, [ OperatorToken({ body: "||" }) ]),
                            currentToken: ""
                        };
                    } else {
                        return { ...info, tokens: List.append(info.tokens, [ PipeToken({ }) ]) };
                    };
                };
            }
            case "{": {
                if (info.body[info.index + 1] === "-") {
                    return {
                        ...info,
                        currentToken: info.currentToken + char,
                        state: Keyword({ })
                    };
                } else {
                    return {
                        ...info,
                        tokens: List.append(info.tokens, [ OpenCurlyBracesToken({ }) ]),
                        currentToken: ""
                    };
                };
            }
            case "}": {
                return {
                ...info,
                tokens: List.append(info.tokens, [ CloseCurlyBracesToken({ }) ]),
                currentToken: ""
            };
            }
            default: {
                if (isEscape(char)) {
                    return {
                        ...info,
                        tokens: List.append(info.tokens, [ OperatorToken({ body: char }) ]),
                        currentToken: ""
                    };
                } else {
                    const otherTokens: Token[] = isLast ? checkKeywordToken(info.currentToken + char) : [ ];
                    return {
                        ...info,
                        tokens: List.append(info.tokens, otherTokens),
                        currentToken: info.currentToken + char,
                        state: Keyword({ })
                    };
                };
            }
        }
    })();
    return { ...nextInfo, index: nextInfo.index + 1 };
}

function tokenizeHelp(info: TokenizeInfo): TokenizeInfo {
    const char: string = info.body[info.index];
    const previousChar: string = info.index === 0 ? "" : info.body[info.index - 1];
    const isLast: boolean = info.body.length - 1 === info.index;
    if (info.index >= info.body.length) {
        return info;
    } else {
        switch (info.state.kind) {
            case "InWhitespace": {
                return tokenizeHelpInWhitespaceOrEmpty(info);
            }
            case "Empty": {
                return tokenizeHelpInWhitespaceOrEmpty(info);
            }
            case "InString": {
                if (char === `"` && not(isEscape(previousChar))) {
                    const token: Token = StringToken({ body: info.currentToken + `"` });
                    return {
                        ...info,
                        state: Empty({ }),
                        currentToken: "",
                        tokens: List.append(info.tokens, [ token ]),
                        index: info.index + 1
                    };
                } else {
                    return {
                        ...info,
                        currentToken: info.currentToken + char,
                        index: info.index + 1
                    };
                };
            }
            case "InFormatString": {
                if (char === "`" && not(isEscape(previousChar))) {
                    const token: Token = FormatStringToken({ body: info.currentToken + "`" });
                    return {
                        ...info,
                        state: Empty({ }),
                        currentToken: "",
                        tokens: List.append(info.tokens, [ token ]),
                        index: info.index + 1
                    };
                } else {
                    return {
                        ...info,
                        currentToken: info.currentToken + char,
                        index: info.index + 1
                    };
                };
            }
            case "InBracket": {
                const { depth } = info.state;
                if (char === ")") {
                    if (depth === 0) {
                        const otherTokens: Token[] = tokenize(info.currentToken);
                        const allTokens: Token[] = (function(x: any) {
                            return List.append(x, [ CloseBracketToken({ }) ]);
                        })(List.append(info.tokens, otherTokens));
                        return {
                            ...info,
                            state: Empty({ }),
                            currentToken: "",
                            tokens: allTokens,
                            index: info.index + 1
                        };
                    } else {
                        return {
                            ...info,
                            state: InBracket({ depth: depth - 1 }),
                            currentToken: info.currentToken + ")",
                            index: info.index + 1
                        };
                    };
                } else {
                    if (char === "(") {
                        return {
                            ...info,
                            state: InBracket({ depth: depth + 1 }),
                            currentToken: info.currentToken + "(",
                            index: info.index + 1
                        };
                    } else {
                        return {
                            ...info,
                            currentToken: info.currentToken + char,
                            index: info.index + 1
                        };
                    };
                };
            }
            case "InSquareBracket": {
                const { depth } = info.state;
                if (char === "]") {
                    if (depth === 0) {
                        const newToken: Token = LiteralToken({ body: info.currentToken + "]" });
                        const allTokens: Token[] = List.append(info.tokens, [ newToken ]);
                        return {
                            ...info,
                            state: Empty({ }),
                            currentToken: "",
                            tokens: allTokens,
                            index: info.index + 1
                        };
                    } else {
                        return {
                            ...info,
                            state: InSquareBracket({ depth: depth - 1 }),
                            currentToken: info.currentToken + char,
                            index: info.index + 1
                        };
                    };
                } else {
                    if (char === "[") {
                        return {
                            ...info,
                            state: InSquareBracket({ depth: depth + 1 }),
                            currentToken: info.currentToken + char,
                            index: info.index + 1
                        };
                    } else {
                        return {
                            ...info,
                            currentToken: info.currentToken + char,
                            index: info.index + 1
                        };
                    };
                };
            }
            case "Keyword": {
                const isWhitespace: boolean = char === "\n" || char === " ";
                if (isLast) {
                    if (char === ")") {
                        const otherTokens: Token[] = checkKeywordToken(info.currentToken);
                        const allTokens: Token[] = (function(x: any) {
                            return List.append(x, [ CloseBracketToken({ }) ]);
                        })(List.append(info.tokens, otherTokens));
                        return {
                            ...info,
                            state: Empty({ }),
                            currentToken: "",
                            tokens: allTokens,
                            index: info.index + 1
                        };
                    } else {
                        const currentToken: string = isWhitespace ? info.currentToken : info.currentToken + char;
                        const otherTokens: Token[] = checkKeywordToken(currentToken);
                        const maybeWhiteSpaceToken: Token[] = isLast && isWhitespace ? [ WhitespaceToken({ body: char }) ] : [ ];
                        const allTokens: Token[] = (function(x: any) {
                            return List.append(x, maybeWhiteSpaceToken);
                        })(List.append(info.tokens, otherTokens));
                        return {
                            ...info,
                            state: Empty({ }),
                            currentToken: "",
                            tokens: allTokens,
                            index: info.index + 1
                        };
                    };
                } else {
                    if (isWhitespace) {
                        const otherTokens: Token[] = checkKeywordToken(info.currentToken);
                        const maybeWhiteSpaceToken: Token[] = isLast ? [ WhitespaceToken({ body: char }) ] : [ ];
                        const allTokens: Token[] = (function(x: any) {
                            return List.append(x, maybeWhiteSpaceToken);
                        })(List.append(info.tokens, otherTokens));
                        const currentToken: string = isLast ? "" : char;
                        return {
                            ...info,
                            state: Empty({ }),
                            currentToken,
                            tokens: allTokens,
                            index: info.index + 1
                        };
                    } else {
                        switch (char) {
                            case ":": {
                                if (info.body[info.index + 1] === ":") {
                                    const allTokens: Token[] = List.append(info.tokens, [ IdentifierToken({ body: info.currentToken }), OperatorToken({ body: "::" }) ]);
                                    return {
                                        ...info,
                                        currentToken: "",
                                        tokens: allTokens,
                                        state: Empty({ }),
                                        index: info.index + 2
                                    };
                                } else {
                                    const allTokens: Token[] = List.append(info.tokens, [ IdentifierToken({ body: info.currentToken }), ColonToken({ }) ]);
                                    return {
                                        ...info,
                                        currentToken: "",
                                        tokens: allTokens,
                                        state: Empty({ }),
                                        index: info.index + 1
                                    };
                                };
                            }
                            case ",": {
                                const allTokens: Token[] = List.append(info.tokens, [ IdentifierToken({ body: info.currentToken }), CommaToken({ }) ]);
                                return {
                                ...info,
                                currentToken: "",
                                tokens: allTokens,
                                state: Empty({ }),
                                index: info.index + 1
                            };
                            }
                            case "(": {
                                const otherTokens: Token[] = checkKeywordToken(info.currentToken);
                                const allTokens: Token[] = (function(x: any) {
                                    return List.append(x, [ OpenBracketToken({ }) ]);
                                })(List.append(info.tokens, otherTokens));
                                return {
                                ...info,
                                currentToken: "",
                                tokens: allTokens,
                                state: Empty({ }),
                                index: info.index + 1
                            };
                            }
                            case ")": {
                                const allTokens: Token[] = List.append(info.tokens, [ IdentifierToken({ body: info.currentToken }), CloseBracketToken({ }) ]);
                                return {
                                ...info,
                                currentToken: "",
                                tokens: allTokens,
                                state: Empty({ }),
                                index: info.index + 1
                            };
                            }
                            default: {
                                return {
                                ...info,
                                currentToken: info.currentToken + char,
                                index: info.index + 1
                            };
                            }
                        };
                    };
                };
            }
        };
    }
}

function tokenize(body: string): Token[] {
    const initialState: TokenizeInfo = {
        state: Empty({ }),
        currentToken: "",
        tokens: [ ],
        body,
        index: 0
    };
    const chars: string[] = body.split("");
    const calculatedState: TokenizeInfo = List.statefulFold(function(item: any, state: any) {
        return tokenizeHelp(state);
    }, initialState, chars);
    return calculatedState.tokens;
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
            const { body } = token;
            return body;
        }
        case "IdentifierToken": {
            const { body } = token;
            return body;
        }
        case "MultilineCommentToken": {
            const { body } = token;
            return body;
        }
        case "KeywordToken": {
            const { body } = token;
            return body;
        }
        case "LiteralToken": {
            const { body } = token;
            return body;
        }
        case "OpenBracketToken": {
            return "(";
        }
        case "OpenCurlyBracesToken": {
            return "{";
        }
        case "OperatorToken": {
            const { body } = token;
            return body;
        }
        case "PipeToken": {
            return "|";
        }
        case "StringToken": {
            const { body } = token;
            return body;
        }
        case "WhitespaceToken": {
            const { body } = token;
            return body;
        }
    }
}

function tokensToString(tokens: Token[]): string {
    return (function(x: any) {
        return x.join("");
    })(List.map(tokenToString, tokens));
}

type Ok<b> = {
    kind: "Ok";
    value: b;
};

function Ok<b>(args: { value: b }): Ok<b> {
    return {
        kind: "Ok",
        ...args,
    };
}

type Err<a> = {
    kind: "Err";
    error: a;
};

function Err<a>(args: { error: a }): Err<a> {
    return {
        kind: "Err",
        ...args,
    };
}

type Result<a, b> = Ok<b> | Err<a>;

type TokenizeTypeInfo = {
    rootTypeTokens: RootTypeTokens[];
    currentBuffer: TypeTokenRaw[];
    indent: number;
    index: number;
    tokens: Token[];
    error: string[];
}

function TokenizeTypeInfo(args: { rootTypeTokens: RootTypeTokens[], currentBuffer: TypeTokenRaw[], indent: number, index: number, tokens: Token[], error: string[] }): TokenizeTypeInfo {
    return {
        ...args,
    };
}

type ComposeTypeInfo = {
    buffer: TypeTokenRaw[];
    index: number;
    depth: number;
    inner: Token[];
    collectedInners: RootTypeTokens[][];
    error: string[];
}

function ComposeTypeInfo(args: { buffer: TypeTokenRaw[], index: number, depth: number, inner: Token[], collectedInners: RootTypeTokens[][], error: string[] }): ComposeTypeInfo {
    return {
        ...args,
    };
}

function finalCompose(info: ComposeTypeInfo): Result<string, RootTypeTokens[]> {
    if (info.error.length > 0) {
        return Err({ error: info.error[0] });
    } else {
        const flattened: RootTypeTokens[] = List.foldl(function(x: any, xs: any) {
            return xs.concat(x);
        }, [ ], info.collectedInners);
        return Ok({ value: [ BaseTypeToken({ body: [ info.buffer[0], ...flattened ] }) ] });
    }
}

function composeType(info: ComposeTypeInfo): ComposeTypeInfo {
    if (info.index >= info.buffer.length || info.error.length > 0) {
        return info;
    } else {
        const t: TypeTokenRaw = info.buffer[info.index];
        switch (t.kind) {
            case "OpenBracketToken": {
                if (info.depth > 0) {
                    return composeType({
                        ...info,
                        inner: List.append(info.inner, [ t ]),
                        depth: info.depth + 1,
                        index: info.index + 1
                    });
                } else {
                    return composeType({
                        ...info,
                        depth: info.depth + 1,
                        index: info.index + 1
                    });
                };
            }
            case "CloseBracketToken": {
                if (info.depth === 1) {
                    const innerTokenized: Result<string, RootTypeTokens[]> = tokenizeType(info.inner);
                    switch (innerTokenized.kind) {
                        case "Err": {
                            const { error } = innerTokenized;
                            return composeType({ ...info, error: [ error ] });
                        }
                        case "Ok": {
                            const { value } = innerTokenized;
                            return composeType({
                            ...info,
                            collectedInners: List.append(info.collectedInners, [ value ]),
                            inner: [ ],
                            depth: 0,
                            index: info.index + 1
                        });
                        }
                    };
                } else {
                    if (info.depth === 0) {
                        return composeType({ ...info, index: info.index + 1 });
                    } else {
                        return composeType({
                            ...info,
                            index: info.index + 1,
                            inner: List.append(info.inner, [ t ]),
                            depth: info.depth - 1
                        });
                    };
                };
            }
            case "IdentifierToken": {
                const { body } = t;
                if (info.depth === 0) {
                    const tokenized: Result<string, RootTypeTokens[]> = tokenizeType(tokenize(body));
                    switch (tokenized.kind) {
                        case "Err": {
                            const { error } = tokenized;
                            return composeType({ ...info, error: [ error ] });
                        }
                        case "Ok": {
                            const { value } = tokenized;
                            return composeType({
                            ...info,
                            index: info.index + 1,
                            collectedInners: List.append(info.collectedInners, [ value ])
                        });
                        }
                    };
                } else {
                    return composeType({
                        ...info,
                        index: info.index + 1,
                        inner: List.append(info.inner, [ t ])
                    });
                };
            }
            case "ArrowToken": {
                if (info.depth === 0) {
                    return composeType({ ...info, index: info.index + 1 });
                } else {
                    return composeType({
                        ...info,
                        index: info.index + 1,
                        inner: List.append(info.inner, [ t ])
                    });
                };
            }
            default: {
                return composeType({ ...info, index: info.index + 1 });
            }
        };
    }
}

function processTokenizeTypeInfo(info: TokenizeTypeInfo): Result<string, RootTypeTokens[]> {
    const hasOpenBracketToken: boolean = info.currentBuffer.find(function(t: any) {
        return t.kind === "OpenBracketToken";
    }) ? true : false;
    const isFunction: boolean = info.currentBuffer.find(function(t: any) {
        return t.kind === "ArrowToken";
    }) ? true : false;
    switch (info.currentBuffer.length) {
        case info.currentBuffer.length: {
            if (info.currentBuffer.length >= 1) {
                const [ first, ...rest ] = info.currentBuffer;
                if (hasOpenBracketToken) {
                const tokenized: Result<string, RootTypeTokens[]> = first.kind === "IdentifierToken" && not(isFunction) ? finalCompose(composeType({
                    buffer: info.currentBuffer,
                    index: 1,
                    depth: 0,
                    inner: [ ],
                    collectedInners: [ ],
                    error: [ ]
                })) : tokenizeType(info.currentBuffer);
                switch (tokenized.kind) {
                    case "Err": {
                        const { error } = tokenized;
                        return Err({ error });
                    }
                    case "Ok": {
                        const { value } = tokenized;
                        if (isFunction) {
                            return Ok({ value: List.append(info.rootTypeTokens, [ FunctionTypeToken({ body: value }) ]) });
                        } else {
                            return Ok({ value: List.append(info.rootTypeTokens, value) });
                        };
                    }
                };
            } else {
                if (isFunction) {
                    const tokenized: Result<string, RootTypeTokens[]> = tokenizeType(info.currentBuffer);
                    switch (tokenized.kind) {
                        case "Err": {
                            const { error } = tokenized;
                            return Err({ error });
                        }
                        case "Ok": {
                            const { value } = tokenized;
                            return Ok({ value: List.append(info.rootTypeTokens, [ FunctionTypeToken({ body: value }) ]) });
                        }
                    };
                } else {
                    function innerHelp(tokens: TypeTokenRaw[]): Result<string, TypeToken[]> {
                        switch (tokens.length) {
                            case 0: {
                                return Ok({ value: [ ] });
                            }
                            case tokens.length: {
                                if (tokens.length >= 1) {
                                    const [ x, ...rest ] = tokens;
                                    const tokenized: Result<string, TypeToken[]> = tokenizeType([ x ]);
                                    switch (tokenized.kind) {
                                    case "Err": {
                                        const { error } = tokenized;
                                        return Err({ error });
                                    }
                                    case "Ok": {
                                        const { value } = tokenized;
                                        const _res832456996 = innerHelp(rest);
                                        switch (_res832456996.kind) {
                                            case "Ok": {
                                                const { value: other } = _res832456996;
                                                return Ok({ value: List.append(value, other) });
                                            }
                                            case "Err": {
                                                const { error } = _res832456996;
                                                return Err({ error });
                                            }
                                        };
                                    }
                                };
                                }
                            }
                            default: {
                                return Ok({ value: [ ] });
                            }
                        }
                    }
                    const inner: Result<string, TypeToken[]> = info.currentBuffer.length > 1 ? innerHelp(info.currentBuffer.slice(1)) : Ok({ value: [ ] });
                    const otherTokens: TypeToken[] = (function (): any {
                        switch (inner.kind) {
                            case "Ok": {
                                const { value } = inner;
                                return BaseTypeToken({ body: List.append([ info.currentBuffer[0] ], value) });
                            }
                            case "Err": {
                                const { error } = inner;
                                return [ ];
                            }
                        }
                    })();
                    switch (inner.kind) {
                        case "Err": {
                            const { error } = inner;
                            return inner;
                        }
                        case "Ok": {
                            const { value } = inner;
                            return (function(x: any) {
                            return Ok({ value: x });
                        })(List.append(info.rootTypeTokens, otherTokens));
                        }
                    };
                };
            };
            }
        }
        default: {
            return Ok({ value: info.rootTypeTokens });
        }
    }
}

function finalTokenizeType(info: TokenizeTypeInfo): Result<string, RootTypeTokens[]> {
    if (info.error.length > 0) {
        return Err({ error: info.error[0] });
    } else {
        return processTokenizeTypeInfo(info);
    }
}

function tokenizeTypeHelp(info: TokenizeTypeInfo): TokenizeTypeInfo {
    if (info.index >= info.tokens.length || info.error.length > 0) {
        return info;
    } else {
        const token: Token = info.tokens[info.index];
        const nextInfo: TokenizeTypeInfo = (function (): any {
            switch (token.kind) {
                case "OpenBracketToken": {
                    if (info.indent > 0 || info.currentBuffer.length > 0) {
                        return {
                            ...info,
                            index: info.index + 1,
                            indent: info.indent + 1,
                            currentBuffer: List.append(info.currentBuffer, [ token ])
                        };
                    } else {
                        return {
                            ...info,
                            index: info.index + 1,
                            indent: info.indent + 1
                        };
                    };
                }
                case "CloseBracketToken": {
                    if (info.indent > 0) {
                        return {
                            ...info,
                            indent: info.indent - 1,
                            index: info.index + 1,
                            currentBuffer: List.append(info.currentBuffer, [ token ])
                        };
                    } else {
                        return {
                            ...info,
                            indent: info.indent - 1,
                            index: info.index + 1
                        };
                    };
                }
                case "ArrowToken": {
                    if (info.indent === 0) {
                        const isFunction: boolean = info.currentBuffer.find(function(t: any) {
                            return t.kind === "ArrowToken";
                        }) ? true : false;
                        const tokenized: Result<string, RootTypeTokens[]> = tokenizeType(info.currentBuffer);
                        switch (tokenized.kind) {
                            case "Err": {
                                const { error } = tokenized;
                                return { ...info, error: [ error ] };
                            }
                            case "Ok": {
                                const { value } = tokenized;
                                if (isFunction) {
                                    return {
                                        ...info,
                                        index: info.index + 1,
                                        rootTypeTokens: List.append(info.rootTypeTokens, [ FunctionTypeToken({ body: value }) ]),
                                        currentBuffer: [ ]
                                    };
                                } else {
                                    return {
                                        ...info,
                                        index: info.index + 1,
                                        rootTypeTokens: List.append(info.rootTypeTokens, value),
                                        currentBuffer: [ ]
                                    };
                                };
                            }
                        };
                    } else {
                        return {
                            ...info,
                            index: info.index + 1,
                            currentBuffer: List.append(info.currentBuffer, [ token ])
                        };
                    };
                }
                case "IdentifierToken": {
                    return {
                    ...info,
                    index: info.index + 1,
                    currentBuffer: List.append(info.currentBuffer, [ token ])
                };
                }
                case "StringToken": {
                    return {
                    ...info,
                    index: info.index + 1,
                    currentBuffer: List.append(info.currentBuffer, [ token ])
                };
                }
                default: {
                    return { ...info, index: info.index + 1 };
                }
            }
        })();
        return nextInfo;
    }
}

function tokenizeType(tokens: Token[]): Result<string, RootTypeTokens[]> {
    const initialState: TokenizeTypeInfo = {
        rootTypeTokens: [ ],
        currentBuffer: [ ],
        indent: 0,
        index: 0,
        tokens,
        error: [ ]
    };
    const calculatedState: TokenizeTypeInfo = List.statefulFold(function(item: any, state: any) {
        return tokenizeTypeHelp(state);
    }, initialState, tokens);
    return finalTokenizeType(calculatedState);
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
        case "StringToken": {
            return `${token.body}`;
        }
    }
}

function isNested(token: RootTypeTokens): boolean {
    switch (token.kind) {
        case "BaseTypeToken": {
            const { body } = token;
            return body.length !== 1;
        }
        case "FunctionTypeToken": {
            return true;
        }
    }
}

function rootTypeTokenToString(token: RootTypeTokens): string {
    switch (token.kind) {
        case "BaseTypeToken": {
            function valueToString(value: TypeToken): string {
                switch (value.kind) {
                    case "BaseTypeToken": {
                        const { body } = value;
                        const inner: string[] = List.map(typeTokenToString, body);
                        if (isNested(value)) {
                            return (function(x: any) {
                                return x.join(" ");
                            })((function(x: any) {
                                return List.append(x, [ typeTokenToString(CloseBracketToken({ })) ]);
                            })(List.append([ typeTokenToString(OpenBracketToken({ })) ], inner)));
                        } else {
                            return (function(x: any) {
                                return x.join(" ");
                            })(inner);
                        };
                    }
                    default: {
                        return typeTokenToString(value);
                    }
                }
            }
            return (function(x: any) {
            return x.join(" ");
        })(List.map(valueToString, token.body));
        }
        case "FunctionTypeToken": {
            function valueToString(value: TypeToken, index: number): string {
                if (index < token.body.length - 1) {
                    return (function(x: any) {
                        return x.join(" ");
                    })([ typeTokenToString(value), typeTokenToString(ArrowToken({ })) ]);
                } else {
                    return (function(x: any) {
                        return x.join(" ");
                    })([ typeTokenToString(value) ]);
                }
            }
            const mapped: string[] = List.indexedMap(valueToString, token.body);
            return (function(xs: any) {
            return xs.join(" ");
        })((function(xs: any) {
            return List.append(xs, [ typeTokenToString(CloseBracketToken({ })) ]);
        })(List.append([ typeTokenToString(OpenBracketToken({ })) ], mapped)));
        }
    }
}

function rootTypeTokensToString(tokens: RootTypeTokens[]): string {
    const arrow: string = typeTokenToString(ArrowToken({ }));
    return (function(x: any) {
        return x.join(` ${arrow} `);
    })(List.map(rootTypeTokenToString, tokens));
}
