import { Just, Maybe, Nothing } from "@eeue56/ts-core/build/main/lib/maybe";
import {
    Err,
    mapError,
    Ok,
    Result,
} from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks, typeBlocks } from "./Blocks";
import { isBuiltinType, isReservedName } from "./builtins";
import { collisions } from "./Collisions";
import {
    CloseBracketToken,
    CloseCurlyBracesToken,
    IdentifierToken,
    OpenBracketToken,
    OpenCurlyBracesToken,
    RootTypeTokens,
    Token,
    tokenize,
    tokenizeType,
    tokensToString,
    TypeToken,
} from "./tokens";
import {
    Addition,
    And,
    AnonFunctionArg,
    Block,
    Branch,
    BranchPattern,
    CaseStatement,
    Comment,
    Const,
    Constructor,
    ContextModule,
    Default,
    Destructure,
    Division,
    DoBlock,
    DoExpression,
    EmptyList,
    Equality,
    Export,
    Expression,
    Field,
    FixedType,
    FormatStringValue,
    Function,
    FunctionArg,
    FunctionArgsUnion,
    FunctionCall,
    FunctionType,
    GenericType,
    GreaterThan,
    GreaterThanOrEqual,
    IfStatement,
    Import,
    ImportModule,
    InEquality,
    isLeftPipeableExpression,
    Lambda,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListDestructure,
    ListPrepend,
    ListRange,
    ListValue,
    Module,
    ModuleReference,
    MultilineComment,
    Multiplication,
    ObjectLiteral,
    Or,
    Property,
    RightPipe,
    StringValue,
    Subtraction,
    Tag,
    TagArg,
    Type,
    TypeAlias,
    TypedBlock,
    UnionType,
    UnparsedBlock,
    Value,
} from "./types";
import { validateType } from "./type_checking";

function afterArrow(tokens: TypeToken[]): TypeToken[] {
    let index = 0;
    while (index < tokens.length) {
        if (tokens[index].kind !== "ArrowToken") break;

        index++;
    }

    return tokens.slice(index);
}

function splitOnArrowTokens(tokens: Token[]): Token[][] {
    const results = [ ];

    let lastIndex = 0;
    let index = 0;
    while (index < tokens.length) {
        if (tokens[index].kind === "ArrowToken") {
            results.push(tokens.slice(lastIndex, index));
            lastIndex = index + 1;
        }

        index++;
    }

    if (index > lastIndex) {
        results.push(tokens.slice(lastIndex, index));
    }

    return results;
}

function parseTypeToken(token: TypeToken): Result<string, Type> {
    switch (token.kind) {
        case "ArrowToken": {
            return Err("Unexpected arrow in type");
        }
        case "BaseTypeToken": {
            const rootType = token.body[0];
            if (rootType.kind === "IdentifierToken") {
                const parsedTypes = afterArrow(token.body.slice(1)).map(
                    parseTypeToken
                );

                if (parsedTypes.length === 0) {
                    if (
                        isBuiltinType(rootType.body) &&
                        rootType.body !== "any"
                    ) {
                        return Ok(FixedType(rootType.body, [ ]));
                    } else if (rootType.body.toLowerCase() === rootType.body) {
                        return Ok(GenericType(rootType.body));
                    }
                }

                const errors = [ ];
                const correct = [ ];
                for (const parsed of parsedTypes) {
                    if (parsed.kind === "Ok") {
                        correct.push(parsed.value);
                    } else {
                        errors.push(parsed.error);
                    }
                }

                if (errors.length > 0) {
                    return Err(errors.join("\n"));
                }

                return Ok(FixedType(rootType.body, correct));
            }
            return Err(`Invalid root type ${rootType.kind}`);
        }
        case "CloseBracketToken": {
            return Err("Unexpected close bracket in type");
        }
        case "FunctionTypeToken": {
            const parsedTypes = token.body.map((x) => {
                return parseTypeToken(x);
            });
            const errors = [ ];
            const correct = [ ];

            for (const parsed of parsedTypes) {
                if (parsed.kind === "Ok") {
                    correct.push(parsed.value);
                } else {
                    errors.push(parsed.error);
                }
            }

            if (errors.length > 0) {
                return Err(errors.join("\n"));
            }

            return Ok(FunctionType(correct));
        }
        case "IdentifierToken": {
            if (isBuiltinType(token.body) && token.body !== "any") {
                return Ok(FixedType(token.body, [ ]));
            } else if (token.body.toLowerCase() === token.body) {
                return Ok(GenericType(token.body));
            }

            return Ok(FixedType(token.body, [ ]));
        }
        case "OpenBracketToken": {
            return Err("Unexected open bracket in type");
        }
    }
}

function parseRootTypeTokens(token: RootTypeTokens): Result<string, Type> {
    switch (token.kind) {
        case "BaseTypeToken": {
            return parseTypeToken(token);
        }
        case "FunctionTypeToken": {
            return parseTypeToken(token);
        }
    }
}

function parseType(tokens: Token[]): Result<string, Type> {
    let index = 0;

    while (index < tokens.length) {
        if (tokens[index].kind === "IdentifierToken") {
            break;
        }
        index++;
    }

    if (index === tokens.length || tokens[index].kind !== "IdentifierToken") {
        return Err(
            `Missing type definition. Got: \`${tokensToString(tokens)}\``
        );
    }
    const rootTypeName = (tokens[index] as IdentifierToken).body;

    if (isBuiltinType(rootTypeName) && rootTypeName !== "any") {
        return Ok(FixedType(rootTypeName, [ ]));
    } else if (rootTypeName.toLowerCase() === rootTypeName) {
        return Ok(GenericType(rootTypeName));
    }

    index++;
    let buffer: Token[] = [ ];
    let bracketDepth = 0;
    let foundSomething = false;
    const parsedTypes = [ ];

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                if (bracketDepth === 0) {
                    if (!foundSomething) break;
                    if (buffer.length === 0) break;
                    parsedTypes.push(parseType(buffer));
                    buffer = [ ];
                } else {
                    buffer.push(token);
                }
                break;
            }

            case "OpenBracketToken": {
                bracketDepth++;
                if (bracketDepth > 1) buffer.push(token);
                break;
            }

            case "CloseBracketToken": {
                bracketDepth--;
                if (bracketDepth === 0) {
                    parsedTypes.push(parseType(buffer));
                    buffer = [ ];
                } else {
                    buffer.push(token);
                }
                break;
            }

            case "IdentifierToken": {
                foundSomething = true;
                buffer.push(token);
                break;
            }

            default: {
                return Err(
                    `Expected identifier, brackets, or whitespace, but got ${token.kind}`
                );
            }
        }
        index++;
    }

    if (buffer.length > 0) {
        buffer.forEach((b) => parsedTypes.push(parseType([ b ])));
    }

    return Ok(
        FixedType(
            rootTypeName,
            parsedTypes
                .filter((type_) => type_.kind !== "Err")
                .map((type_) => (type_ as Ok<Type>).value)
        )
    );
}

function parseUnionType(tokens: Token[]): Result<string, UnionType> {
    if (tokens[0].kind === "KeywordToken") {
        if (tokens[0].body !== "type") {
            return Err("Expected `type` but got " + tokens[0].body);
        }
    }

    let typeLine: Token[] = [ ];
    let isInBranches = false;
    let branches = [ ];
    let currentBranch = [ ];

    for (var i = 1; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token.kind) {
            case "IdentifierToken": {
                if (isInBranches) {
                    currentBranch.push(token.body);
                } else {
                    typeLine.push(token);
                }

                break;
            }

            case "PipeToken": {
                branches.push(currentBranch.join(" "));
                currentBranch = [ ];
                break;
            }

            case "WhitespaceToken": {
                typeLine.push(token);
                break;
            }

            case "OpenBracketToken":
            case "CloseBracketToken": {
                continue;
            }

            case "CommaToken": {
                currentBranch.push(",");
                break;
            }

            case "ColonToken": {
                currentBranch.push(":");
                break;
            }

            case "OpenCurlyBracesToken": {
                if (isInBranches) {
                    currentBranch.push("{");
                    break;
                }
            }

            case "CloseCurlyBracesToken": {
                if (isInBranches) {
                    currentBranch.push(" }");
                    break;
                }
            }

            case "AssignToken": {
                isInBranches = true;
                break;
            }

            case "ArrowToken": {
                currentBranch.push("->");
                break;
            }

            default: {
                return Err(
                    "Unexpected token parsing a union type. Got " + token.kind
                );
            }
        }
    }

    if (currentBranch) {
        branches.push(currentBranch.join(" "));
    }

    const parsedType = parseType(typeLine);

    if (parsedType.kind === "Err") return parsedType;

    const tags: Result<string, Tag>[] = branches.map((tag) => {
        if (tag.startsWith("|")) {
            tag = tag.slice(1);
        }
        tag = tag.trim();

        const tagName = tag.split(" ")[0];
        if (tagName.length === 0) {
            return Err(
                `Missing expected tag name for union type \`${tokensToString(
                    typeLine
                )}\``
            );
        }
        if (isReservedName(tagName)) {
            return Err(
                `Redefining ${tagName.trim()} will cause problems. Try renaming it to ${tagName.trim()}Value`
            );
        }

        let argsAsJson = tag.split(" ").slice(1).join(" ");

        const args = argsAsJson
            .split(" ")
            // remove brackets
            .filter((j) => j !== "{" && j !== "}")
            .join(" ")
            // split args by commmas
            .split(",")
            .filter((arg) => arg.trim().length > 0)
            .map((arg) => {
                const property = parseProperty(tokenize(arg));

                if (property.kind === "Err") return property;
                return Ok(TagArg(property.value.name, property.value.type));
            });

        if (
            args.filter((maybeTag) => maybeTag.kind === "Ok").length ===
            args.length
        ) {
            return Ok(
                Tag(
                    tagName,
                    args.map((arg) => (arg as Ok<TagArg>).value)
                )
            );
        }

        return Err(
            "Error parsing args due to:\n" +
                args
                    .filter((arg) => arg.kind === "Err")
                    .map((err) => (err as Err<string>).error)
        );
    });

    if (tags.length === 0) {
        return Err("Not enough tags given.");
    }

    for (var i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag.kind === "Err") {
            return tag;
        }
    }

    if (parsedType.value.kind === "GenericType") {
        return Err(
            "Expected a fixed type but got a generic type for a union type. Maybe you missed a captal letter?"
        );
    }

    if (parsedType.value.kind === "FunctionType") {
        return Err(
            "Expected a fixed type but got a function type for a union type. Maybe you missed a captal letter?"
        );
    }

    return Ok(
        UnionType(
            parsedType.value,
            tags
                .filter((tag) => tag.kind === "Ok")
                .map((tag) => (tag as Ok<Tag>).value)
        )
    );
}

function parseProperty(tokens: Token[]): Result<string, Property> {
    let index = 0;
    let name = null;
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.kind === "WhitespaceToken") {
        } else if (token.kind === "IdentifierToken") {
            if (name) {
                return Err("Got too many identifiers for property name");
            }
            name = token.body;
        } else if (token.kind === "ColonToken") {
            break;
        } else {
            return Err(
                `Expected identifier in property name but got ${token.kind}`
            );
        }

        index++;
    }
    index++;

    if (name === null) {
        return Err("Expected identifier for property name but found nothing");
    }

    let bitsAfterName = tokens.slice(index);

    if (tokens.find((token) => token.kind === "ArrowToken")) {
        bitsAfterName = [
            OpenBracketToken(),
            ...bitsAfterName,
            CloseBracketToken(),
        ];
    }

    const tokenizedTypes = tokenizeType(bitsAfterName);

    if (tokenizedTypes.kind === "Err") return tokenizedTypes;
    const types = tokenizedTypes.value;
    if (types.length > 1) {
        return Err("Too many types found in property");
    }

    if (types.length < 1) return Err("Failed to find type");
    const type = parseRootTypeTokens(types[0]);

    if (type.kind === "Err") return type;
    return Ok(Property(name, type.value));
}

function isRootProperty(line: string): boolean {
    if (line.match(/    .+/)) {
        return true;
    }
    return false;
}

function parseTypeAlias(tokens: Token[]): Result<string, TypeAlias> {
    let index = 0;
    let hasSeenType = false;

    while (index < tokens.length) {
        const token = tokens[index];
        if (token.kind === "KeywordToken") {
            if (hasSeenType) {
                if (token.body === "alias") {
                    break;
                }
            } else if (token.body === "type") {
                hasSeenType = true;
            } else {
                return Err("Expected `type alias` but got " + token);
            }
        }

        index++;
    }

    index += 2;

    let typeLine: Token[] = [ ];
    let isInDefinition = false;
    let currentDefinition = [ ];
    let braceDepth = 0;

    for (var i = index; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token.kind) {
            case "IdentifierToken": {
                if (isInDefinition) {
                    currentDefinition.push(token.body);
                } else {
                    typeLine.push(token);
                }

                break;
            }

            case "WhitespaceToken": {
                continue;
            }

            case "OpenBracketToken": {
                currentDefinition.push("(");
                break;
            }
            case "CloseBracketToken": {
                currentDefinition.push(")");
                break;
            }

            case "CommaToken": {
                currentDefinition.push(",");
                break;
            }

            case "ColonToken": {
                currentDefinition.push(":");
                break;
            }

            case "OpenCurlyBracesToken": {
                if (isInDefinition) {
                    braceDepth += 1;
                    currentDefinition.push("{");
                    break;
                }
                break;
            }

            case "CloseCurlyBracesToken": {
                if (isInDefinition) {
                    if (braceDepth > 0) {
                        currentDefinition.push(" }");
                    }
                    break;
                }
                braceDepth -= 1;
                break;
            }

            case "AssignToken": {
                isInDefinition = true;
                break;
            }

            case "ArrowToken": {
                currentDefinition.push("->");
                break;
            }

            default: {
                return Err(
                    "Unexpected token parsing a type alias. Got " + token.kind
                );
            }
        }
    }

    const parsedAliasName = parseType(typeLine);

    if (parsedAliasName.kind === "Err") {
        return parsedAliasName;
    }

    const aliasName = parsedAliasName.value;

    const recordDefinition = currentDefinition.join(" ");

    let lines: string[] = [ ];
    recordDefinition.split("\n").forEach((line: string) => {
        const hasComma = line.indexOf(",") > -1;

        if (hasComma) {
            const hasTextAfterComma = line.split(",")[1].trim().length > 0;
            if (hasTextAfterComma) {
                lines = lines.concat(
                    ...line.split(",").map((piece) => "    " + piece)
                );
                return;
            }
        }
        lines.push(line);
    });

    let currentBuffer: string[] = [ ];
    const properties: string[] = [ ];

    lines.forEach((line, i) => {
        const isOpeningBrace = line.trim() === "{" && i === 0;
        const isClosingBrace = line.trim() === "}" && i === lines.length - 1;
        const otherThanWhitespace = line
            .split("")
            .filter((x) => x.trim().length > 0)
            .join("");
        const isEmptyBody = otherThanWhitespace === "{}";

        if (isOpeningBrace || isClosingBrace || isEmptyBody) {
            return;
        }

        const hasInlineOpeningBrace = line.trim().startsWith("{") && i === 0;

        if (hasInlineOpeningBrace) {
            line = line.trim().slice(1);
        }

        const hasInlineClosingBrace =
            line.trim().endsWith("}") && i === lines.length - 1;

        if (hasInlineClosingBrace) {
            line = line.slice(0, -1);
        }

        if (isRootProperty(line)) {
            if (currentBuffer.length > 0) {
                properties.push(currentBuffer.join("\n"));
                currentBuffer = [ line ];
            } else {
                currentBuffer.push(line);
            }
        } else {
            currentBuffer.push(line);
        }
    });

    if (currentBuffer.length > 0) {
        properties.push(currentBuffer.join("\n"));
    }

    const parsedProperties = properties.map((x) => parseProperty(tokenize(x)));
    const errors = parsedProperties.filter(
        (property: Result<string, Property>) => property.kind === "Err"
    );

    if (errors.length > 0) {
        return Err(
            errors
                .map(
                    (err: Result<string, Property>) =>
                        (err as Err<string>).error
                )
                .join("\n")
        );
    }

    if (aliasName.kind === "GenericType") {
        return Err(
            "Expected a fixed type but got a generic type for a type alias. Maybe you missed a captal letter?"
        );
    }

    if (aliasName.kind === "FunctionType") {
        return Err(
            "Expected a fixed type but got a function type for a type alias. Maybe you missed a captal letter?"
        );
    }

    return Ok(
        TypeAlias(
            aliasName,
            parsedProperties.map((property) => (property as Ok<Property>).value)
        )
    );
}

function parseObjectLiteral(tokens: Token[]): Result<string, ObjectLiteral> {
    const fields: Field[] = [ ];

    let currentName = "";
    let currentValue: Expression | null = null;
    let objectDepth = 0;
    let innermostBuffer = "";
    let base = null;
    let previousWasBase = false;
    let isInName = false;

    let index = 0;

    while (index < tokens.length) {
        const token = tokens[index];

        if (token.kind === "WhitespaceToken") {
            index++;
            continue;
        }
        break;
    }

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "OpenCurlyBracesToken": {
                objectDepth++;
                if (objectDepth === 1) {
                    isInName = true;
                } else {
                    innermostBuffer += "{";
                }
                break;
            }

            case "CloseCurlyBracesToken": {
                objectDepth--;
                if (objectDepth === 0) {
                    if (innermostBuffer.trim().length === 0) continue;
                    const innerLiteral = parseExpression(innermostBuffer);

                    if (innerLiteral.kind === "Err") return innerLiteral;
                    innermostBuffer = "";
                    currentValue = innerLiteral.value;

                    fields.push(Field(currentName.trim(), currentValue));
                    currentName = "";
                    currentValue = null;
                } else {
                    innermostBuffer += "}";
                }
                break;
            }

            case "ColonToken": {
                if (objectDepth === 1) {
                    isInName = false;
                } else {
                    innermostBuffer += ":";
                }
                break;
            }

            case "CommaToken": {
                if (previousWasBase) {
                    previousWasBase = false;
                    break;
                }

                if (objectDepth > 1) {
                    innermostBuffer += ",";
                } else {
                    const innerLiteral = parseExpression(innermostBuffer);
                    if (innerLiteral.kind === "Err") return innerLiteral;
                    fields.push(Field(currentName.trim(), innerLiteral.value));
                    innermostBuffer = "";
                    currentName = "";
                    isInName = true;
                }
                break;
            }

            case "FormatStringToken":
            case "StringToken":
            case "LiteralToken":
            case "IdentifierToken": {
                if (isInName) {
                    if (token.kind === "IdentifierToken") {
                        if (token.body.startsWith("...")) {
                            base = Value(token.body);
                            previousWasBase = true;
                            break;
                        }
                    }
                    currentName += token.body;
                } else {
                    innermostBuffer += token.body;
                }
                break;
            }

            case "OperatorToken": {
                if (!isInName) {
                    innermostBuffer += token.body;
                }
                break;
            }

            case "WhitespaceToken": {
                if (!isInName) {
                    innermostBuffer += token.body;
                }
                break;
            }

            case "ArrowToken": {
                innermostBuffer += "->";
            }
        }

        index++;
    }

    return Ok(ObjectLiteral(base, fields));
}

function parseValue(tokens: Token[]): Result<string, Value | Constructor> {
    const body: string[] = [ ];

    let index = 0;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                break;
            }
            case "LiteralToken":
            case "IdentifierToken": {
                body.push(token.body);
                break;
            }
            case "OpenBracketToken": {
                body.push("(");
                break;
            }
            case "CloseBracketToken": {
                body.push(")");
                break;
            }
            default: {
                return Err(`Expected value but got ${token.kind}`);
            }
        }
        index++;
    }

    const firstChar = body.join("").slice(0, 1);
    if (
        firstChar !== "-" &&
        firstChar.toUpperCase() === firstChar &&
        isNaN(parseFloat(firstChar))
    ) {
        return parseConstructor(tokens);
    }

    return Ok(Value(body.join("")));
}

function parseStringValue(tokens: Token[]): Result<string, StringValue> {
    if (tokens[0].kind === "StringToken")
        return Ok(StringValue(tokens[0].body.slice(1, -1)));

    return Err(`Expected string literal, got ${tokens[0].kind}`);
}

function listRangeDotsNotWithinString(tokens: Token[]): boolean {
    let i = 0;

    for (const token of tokens) {
        if (token.kind !== "WhitespaceToken") break;
        i++;
    }

    if (i === tokens.length) return true;

    const firstToken = tokens[i];

    if (firstToken.kind === "LiteralToken" && firstToken.body.startsWith("[")) {
        const newTokens = tokenize(firstToken.body.slice(1));

        for (const token of newTokens) {
            if (
                (token.kind === "LiteralToken" ||
                    token.kind === "IdentifierToken") &&
                token.body.indexOf("..") > -1
            ) {
                return true;
            }
        }
    }
    return false;
}

function parseListRange(tokens: Token[]): Result<string, ListRange> {
    let index = 0;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                break;
            }

            case "LiteralToken": {
                const trimmed = token.body.trim().slice(1).slice(0, -1);
                const pieces = trimmed.split("..");
                const start = parseValue(tokenize(pieces[0]));
                const end = parseValue(tokenize(pieces[1]));

                if (start.kind === "Err") return start;
                if (end.kind === "Err") return end;

                if (start.kind === "Ok" && start.value.kind === "Constructor")
                    return Err("Expected variable but got constructor");

                if (end.kind === "Ok" && end.value.kind === "Constructor")
                    return Err("Expected variable but got constructor");

                return Ok(ListRange(start.value as Value, end.value as Value));
            }

            default: {
                return Err(
                    `Unxpected ${token.kind}, expected whitespace or literal`
                );
            }
        }
        index++;
    }

    return Err("Failed to find list range. They should look like [1..2]");
}

function parseListValue(tokens: Token[]): Result<string, ListValue> {
    let index = 0;
    let isFound = false;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "LiteralToken": {
                isFound = true;
            }
        }
        if (isFound) break;
        index++;
    }

    const parsedValues = [ ];

    // drop leading and trailing []
    const body = tokensToString(tokens.slice(index));
    const trimmed = body.trim();
    const innerBody = trimmed.slice(1, trimmed.length - 1).trim();

    if (innerBody.trim().length === 0) return Ok(ListValue([ ]));

    const innerTokens = tokenize(innerBody);
    let innerIndex = 0;
    let currentBuffer = [ ];
    let depth = 0;

    while (innerIndex < innerTokens.length) {
        const token = innerTokens[innerIndex];
        switch (token.kind) {
            case "OpenCurlyBracesToken": {
                currentBuffer.push(OpenCurlyBracesToken());
                depth++;
                break;
            }
            case "CloseCurlyBracesToken": {
                currentBuffer.push(CloseCurlyBracesToken());
                depth--;
                break;
            }
            case "CommaToken": {
                if (depth === 0) {
                    parsedValues.push(
                        parseExpression(tokensToString(currentBuffer))
                    );
                    currentBuffer = [ ];
                    break;
                }
            }
            default: {
                currentBuffer.push(token);
            }
        }

        innerIndex++;
    }

    if (currentBuffer.length > 0) {
        parsedValues.push(parseExpression(tokensToString(currentBuffer)));
    }

    const errors = parsedValues.filter((part) => part.kind === "Err");
    const passedValues = parsedValues.filter((part) => part.kind === "Ok");

    if (errors.length > 0)
        return Err(
            `Invalid array: ${errors
                .map((error) => (error as Err<string>).error)
                .join(",")}`
        );

    if (passedValues.length === 0) {
        return Ok(ListValue([ ]));
    } else {
        return Ok(
            ListValue(
                passedValues.map((value) => (value as Ok<Expression>).value)
            )
        );
    }
}

function parseFormatStringValue(
    tokens: Token[]
): Result<string, FormatStringValue> {
    if (tokens[0].kind === "FormatStringToken")
        return Ok(FormatStringValue(tokens[0].body.slice(1, -1)));

    return Err(`Expected string literal, got ${tokens[0].kind}`);
}

function parseDestructure(tokens: Token[]): Result<string, Destructure> {
    let index = 0;
    let constructor = null;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                break;
            }
            case "IdentifierToken": {
                constructor = token.body;
                break;
            }
            default: {
                return Err(
                    `Expected identifier or whitespace but got ${token.kind} while parsing a destructure.`
                );
            }
        }
        if (constructor) break;
        index++;
    }
    index++;

    if (constructor === null)
        return Err("Expected identifer for a destructor but got nothing.");

    let patternParts = [ ];

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                if (patternParts.length === 0) break;
            }
            default: {
                patternParts.push(token);
                break;
            }
        }
        index++;
    }
    index++;

    const pattern = tokensToString(patternParts).trim();

    return Ok(Destructure(constructor, pattern));
}

function parseConstructor(tokens: Token[]): Result<string, Constructor> {
    let index = 0;
    let constructor = null;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                break;
            }
            case "IdentifierToken": {
                constructor = token.body;
                break;
            }
            default: {
                return Err(
                    `Expected identifier or whitespace but got ${token.kind} while parsing constructor.`
                );
            }
        }
        if (constructor) break;
        index++;
    }
    index++;

    if (constructor === null)
        return Err("Expected identifer for a constructor but got nothing.");

    let patternParts = [ ];

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                if (patternParts.length === 0) break;
            }
            default: {
                patternParts.push(token);
                break;
            }
        }
        index++;
    }
    index++;

    const pattern = parseObjectLiteral(patternParts);
    if (pattern.kind === "Err") return pattern;

    return Ok(Constructor(constructor, pattern.value));
}

function parseIfPredicate(tokens: Token[]): Result<string, Expression> {
    const inbetweenTokens = [ ];

    let state: "WaitingForIf" | "BetweenIfAndThen" | "PastThen" =
        "WaitingForIf";

    for (const token of tokens) {
        switch (token.kind) {
            case "KeywordToken": {
                if (token.body === "if") {
                    state = "BetweenIfAndThen";
                    break;
                } else if (token.body === "then") {
                    state = "PastThen";
                    break;
                }
            }
            default: {
                if (state === "BetweenIfAndThen") {
                    inbetweenTokens.push(token);
                }
            }
        }

        if (state === "PastThen") break;
    }

    return parseExpression(tokensToString(inbetweenTokens));
}

function parseIfBody(tokens: Token[]): Result<string, Expression> {
    const inbetweenTokens = [ ];

    let state: "WaitingForThen" | "BetweenThenAndElse" | "PastElse" =
        "WaitingForThen";

    for (const token of tokens) {
        switch (token.kind) {
            case "KeywordToken": {
                if (token.body === "then") {
                    state = "BetweenThenAndElse";
                    break;
                } else if (token.body === "else") {
                    state = "PastElse";
                    break;
                }
            }
            default: {
                if (state === "BetweenThenAndElse") {
                    inbetweenTokens.push(token);
                }
            }
        }

        if (state === "PastElse") break;
    }

    return parseExpression(tokensToString(inbetweenTokens));
}

function parseElseBody(tokens: Token[]): Result<string, Expression> {
    const inbetweenTokens = [ ];

    let state: "WaitingForElse" | "BetweenElseAndEnd" | "PastEnd" =
        "WaitingForElse";

    for (const token of tokens) {
        switch (token.kind) {
            case "KeywordToken": {
                if (token.body === "else") {
                    state = "BetweenElseAndEnd";
                    break;
                }
            }
            default: {
                if (state === "BetweenElseAndEnd") {
                    inbetweenTokens.push(token);
                }
            }
        }
    }

    return parseExpression(tokensToString(inbetweenTokens));
}

function parseIfStatementSingleLine(body: string): Result<string, IfStatement> {
    const parsedPredicate = parseIfPredicate(tokenize(body));
    const parsedIfBody = parseIfBody(tokenize(body));
    const parsedElseBody = parseElseBody(tokenize(body));

    const errors = [ ];
    if (parsedPredicate.kind === "Err") errors.push(parsedPredicate.error);
    if (parsedIfBody.kind === "Err") errors.push(parsedIfBody.error);
    if (parsedElseBody.kind === "Err") errors.push(parsedElseBody.error);

    if (errors.length > 0) {
        return Err(errors.join("\n"));
    }

    return Ok(
        IfStatement(
            (parsedPredicate as Ok<Expression>).value,
            (parsedIfBody as Ok<Expression>).value,
            [ ],
            (parsedElseBody as Ok<Expression>).value,
            [ ]
        )
    );
}

function getIndentLevel(line: string): number {
    return line.split("").reduce(
        (previous, current) => {
            if (previous.seenText) return previous;

            if (current === " ") {
                return {
                    seenText: previous.seenText,
                    indentLevel: previous.indentLevel + 1,
                };
            }
            return {
                seenText: true,
                indentLevel: previous.indentLevel,
            };
        },
        { seenText: false, indentLevel: 0 }
    ).indentLevel;
}

function parseIfStatement(body: string): Result<string, IfStatement> {
    const isSingleLine = body.trim().split("\n").length === 1;

    if (isSingleLine) {
        return parseIfStatementSingleLine(body);
    }

    const lines = body.split("\n").filter((line) => line.trim().length > 0);
    const parsedPredicate = parseIfPredicate(tokenize(body));

    const indentLevel = getIndentLevel(lines[0]);
    const elseIndex = lines.reduce(
        (previous, current, index) => {
            if (previous.found) return previous;

            if (current.trimEnd() === " ".repeat(indentLevel) + "else") {
                return {
                    found: true,
                    index,
                };
            } else {
                return previous;
            }
        },
        { found: false, index: -1 }
    ).index;

    if (elseIndex === -1) {
        return Err("Missing else block");
    }

    const ifBody = lines.slice(1, elseIndex);

    const ifLetStart = ifBody.findIndex(
        (line) =>
            line.startsWith(" ".repeat(indentLevel + 4) + "let") &&
            line.endsWith("let")
    );
    const ifLetEnd = ifBody.findIndex(
        (line) =>
            line.startsWith(" ".repeat(indentLevel + 4) + "in") &&
            line.endsWith("in")
    );

    let ifLetBlock: Block[] = [ ];

    if (ifLetStart > -1 && ifLetEnd > -1) {
        const letLines = ifBody
            .slice(ifLetStart + 1, ifLetEnd)
            .map((line) => line.slice(indentLevel + 8));
        const letBlocks = intoBlocks(letLines.join("\n"));

        ifLetBlock = letBlocks
            .map(parseBlock)
            .filter((block) => block.kind === "Ok")
            .map((block) => (block as Ok<Block>).value);
    }

    const elseBody = lines.slice(elseIndex + 1);

    const elseLetStart = elseBody.findIndex(
        (line) =>
            line.startsWith(" ".repeat(indentLevel + 4) + "let") &&
            line.endsWith("let")
    );
    const elseLetEnd = elseBody.findIndex(
        (line) =>
            line.startsWith(" ".repeat(indentLevel + 4) + "in") &&
            line.endsWith("in")
    );

    let elseLetBlock: Block[] = [ ];

    if (elseLetStart > -1 && elseLetEnd > -1) {
        const letLines = elseBody
            .slice(elseLetStart + 1, elseLetEnd)
            .map((line) => line.slice(indentLevel + 8));
        const letBlocks = intoBlocks(letLines.join("\n"));

        elseLetBlock = letBlocks
            .map(parseBlock)
            .filter((block) => block.kind === "Ok")
            .map((block) => (block as Ok<Block>).value);
    }

    const parsedIfBody = parseExpression(
        ifBody.slice(ifLetEnd === -1 ? 0 : ifLetEnd + 1).join("\n")
    );

    const parsedElseBody = parseExpression(
        elseBody.slice(elseLetEnd === -1 ? 0 : elseLetEnd + 1).join("\n")
    );

    const errors = [ ];
    if (parsedPredicate.kind === "Err") errors.push(parsedPredicate.error);
    if (parsedIfBody.kind === "Err") errors.push(parsedIfBody.error);
    if (parsedElseBody.kind === "Err") errors.push(parsedElseBody.error);

    if (errors.length > 0) {
        return Err(errors.join("\n"));
    }

    return Ok(
        IfStatement(
            (parsedPredicate as Ok<Expression>).value,
            (parsedIfBody as Ok<Expression>).value,
            ifLetBlock,
            (parsedElseBody as Ok<Expression>).value,
            elseLetBlock
        )
    );
}

function isConstructor(str: string): boolean {
    return str[0].toUpperCase() === str[0] && isNaN(parseInt(str, 10));
}

function parseEmptyList(tokens: Token[]): Result<string, EmptyList> {
    const withoutWhitespace = tokens.filter(
        (t) => t.kind !== "WhitespaceToken"
    );
    if (withoutWhitespace.length > 1) {
        return Err("Too many values for empty list.");
    } else if (withoutWhitespace.length === 0) {
        return Err("Expected [] but didn't find one.");
    }

    if (
        withoutWhitespace[0].kind === "LiteralToken" &&
        withoutWhitespace[0].body === "[]"
    ) {
        return Ok(EmptyList());
    }

    return Err(`Expected empty list [] but got ${withoutWhitespace[0].kind}`);
}

function parseListDestructure(
    tokens: Token[]
): Result<string, ListDestructure> {
    const parts = [ ];
    let isInDestructor = false;
    let destructorParts = [ ];

    for (const token of tokens) {
        switch (token.kind) {
            case "WhitespaceToken":
            case "OpenCurlyBracesToken":
            case "CloseCurlyBracesToken":
            case "ColonToken": {
                if (isInDestructor) {
                    destructorParts.push(token);
                }
                break;
            }

            case "LiteralToken": {
                parts.push(EmptyList());
                break;
            }
            case "OperatorToken": {
                if (token.body !== "::") {
                    return Err(
                        `Expected ::, [], or identifier but got ${token.body}`
                    );
                }

                if (isInDestructor) {
                    const destructure = parseDestructure(destructorParts);
                    if (destructure.kind === "Err") return destructure;

                    parts.push(destructure.value);
                    isInDestructor = false;
                    destructorParts = [ ];
                }
                break;
            }
            case "IdentifierToken": {
                if (isConstructor(token.body)) {
                    isInDestructor = true;
                    destructorParts.push(token);
                } else if (isInDestructor) {
                    destructorParts.push(token);
                } else {
                    parts.push(Value(token.body));
                }
                break;
            }
            case "StringToken": {
                parts.push(StringValue(token.body.slice(1, -1)));
                break;
            }
            case "FormatStringToken": {
                parts.push(FormatStringValue(token.body.slice(1, -1)));
                break;
            }
        }
    }

    return Ok(ListDestructure(parts));
}

function parseBranchPattern(tokens: Token[]): Result<string, BranchPattern> {
    let index = 0;

    while (index < tokens.length) {
        if (tokens[index].kind !== "WhitespaceToken") break;
        index++;
    }

    const firstToken = tokens[index];

    if (!firstToken) return Err("Failed to find token in branch.");

    if (hasTopLevelOperator("::", tokens)) {
        return parseListDestructure(tokens);
    }

    switch (firstToken.kind) {
        case "IdentifierToken": {
            if (isConstructor(firstToken.body)) {
                return parseDestructure(tokens);
            }
            if (firstToken.body === "default") {
                return Ok(Default());
            } else {
                return Err(
                    "Expected a string or a destructure, but got an identifier. Try using an if statement instead"
                );
            }
        }
        case "OpenCurlyBracesToken": {
            return parseDestructure(tokens);
        }
        case "StringToken": {
            return parseStringValue(tokens.slice(index));
        }
        case "FormatStringToken": {
            return parseFormatStringValue(tokens.slice(index));
        }
        case "LiteralToken": {
            const emptyList = parseEmptyList(tokens);
            if (emptyList.kind === "Ok") return emptyList;
        }
    }
    return Err(`Expected destructure or string but got ${firstToken.kind}`);
}

function parseCasePredicate(tokens: Token[]): Result<string, Expression> {
    const inbetweenTokens = [ ];

    let state: "WaitingForCase" | "BetweenCaseAndOr" | "PastOf" =
        "WaitingForCase";

    for (const token of tokens) {
        switch (token.kind) {
            case "KeywordToken": {
                if (token.body === "case") {
                    state = "BetweenCaseAndOr";
                    break;
                } else if (token.body === "of") {
                    state = "PastOf";
                    break;
                }
            }
            default: {
                inbetweenTokens.push(token);
            }
        }

        if (state === "PastOf") break;
    }

    return parseExpression(tokensToString(inbetweenTokens));
}

function parseCaseStatement(body: string): Result<string, CaseStatement> {
    body = body
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .join("\n");

    const rootIndentLevel = getIndentLevel(body.split("\n")[0]);

    const casePredicate = parseCasePredicate(tokenize(body));

    let firstIndexOfOf = 0;
    for (const line of body.split("\n")) {
        if (line.endsWith(" of")) {
            break;
        }

        firstIndexOfOf++;
    }

    const lines = body.split("\n");

    let branches: Result<string, Branch>[] = [ ];
    let branchPattern = "";
    let branchLines: string[] = [ ];

    for (var i = firstIndexOfOf + 1; i < lines.length; i++) {
        const line = lines[i];
        const indent = getIndentLevel(line);

        let wasReset = false;

        if (rootIndentLevel + 4 === indent) {
            if (branchPattern === "") {
                const split = splitOnArrowTokens(tokenize(line));
                if (split.length === 1) {
                    branchPattern = tokensToString(split[0]);
                } else if (split.length === 2) {
                    branchPattern = tokensToString(split[0]);
                    branchLines.push(tokensToString(split[1]));
                } else {
                    branches.push(Err(`Failed to parse branch on line ${i}`));
                }
                wasReset = true;
            }

            if (!branchLines.join("").trim()) {
                continue;
            }

            const spaces = " ".repeat(8 + rootIndentLevel);
            const letStart = branchLines.findIndex(
                (line) =>
                    line.startsWith(spaces + "let") && line.endsWith("let")
            );
            const letEnd = branchLines.findIndex(
                (line) => line.startsWith(spaces + "in") && line.endsWith("in")
            );

            let letBlock: Block[] = [ ];

            if (letStart > -1 && letEnd > -1) {
                const letLines = branchLines
                    .slice(letStart + 1, letEnd)
                    .map((line) => line.slice(8 + rootIndentLevel + 4));
                const letBlocks = intoBlocks(letLines.join("\n"));

                letBlock = letBlocks
                    .map(parseBlock)
                    .filter((block) => block.kind === "Ok")
                    .map((block) => (block as Ok<Block>).value);
            }

            const branchExpression = parseExpression(
                branchLines.slice(letEnd + 1).join("\n")
            );

            const parsedBranchPattern = parseBranchPattern(
                tokenize(branchPattern)
            );

            const maybeLetAndDoErrorMessage = letAndDoErrorMessage(
                letStart,
                letEnd
            );

            if (
                branchExpression.kind === "Err" ||
                parsedBranchPattern.kind === "Err" ||
                maybeLetAndDoErrorMessage
            ) {
                if (maybeLetAndDoErrorMessage)
                    branches.push(Err(maybeLetAndDoErrorMessage));
                if (branchExpression.kind === "Err")
                    branches.push(branchExpression);
                if (parsedBranchPattern.kind === "Err")
                    branches.push(parsedBranchPattern);
            } else {
                branches.push(
                    Ok(
                        Branch(
                            (parsedBranchPattern as Ok<BranchPattern>).value,
                            (branchExpression as Ok<Expression>).value,
                            letBlock
                        )
                    )
                );
            }

            if (!wasReset) {
                const split = splitOnArrowTokens(tokenize(line));
                if (split.length === 1) {
                    branchPattern = tokensToString(split[0]);
                    branchLines = [ ];
                } else if (split.length === 2) {
                    branchPattern = tokensToString(split[0]);
                    branchLines = [ tokensToString(split[1]) ];
                } else {
                    branches.push(Err(`Failed to parse branch on line ${i}`));
                }
            } else {
                branchPattern = "";
                branchLines = [ ];
            }
        } else {
            branchLines.push(line);
        }
    }

    if (branchLines.length > 0) {
        const indent = 8;
        const spaces = " ".repeat(indent + rootIndentLevel);
        const letStart = branchLines.findIndex(
            (line) => line.startsWith(spaces + "let") && line.endsWith("let")
        );
        const letEnd = branchLines.findIndex(
            (line) => line.startsWith(spaces + "in") && line.endsWith("in")
        );

        let letBlock: Block[] = [ ];

        if (letStart > -1 && letEnd > -1) {
            const letLines = branchLines
                .slice(letStart + 1, letEnd)
                .map((line) => line.slice(8 + rootIndentLevel + 4));
            const letBlocks = intoBlocks(letLines.join("\n"));

            letBlock = letBlocks
                .map(parseBlock)
                .filter((block) => block.kind === "Ok")
                .map((block) => (block as Ok<Block>).value);
        }

        const branchExpression = parseExpression(
            branchLines.slice(letEnd + 1).join("\n")
        );

        const parsedBranchPattern = parseBranchPattern(tokenize(branchPattern));
        const maybeLetAndDoErrorMessage = letAndDoErrorMessage(
            letStart,
            letEnd
        );

        if (
            branchExpression.kind === "Err" ||
            parsedBranchPattern.kind === "Err" ||
            maybeLetAndDoErrorMessage
        ) {
            if (maybeLetAndDoErrorMessage)
                branches.push(Err(maybeLetAndDoErrorMessage));
            if (branchExpression.kind === "Err")
                branches.push(branchExpression);
            if (parsedBranchPattern.kind === "Err")
                branches.push(parsedBranchPattern);
        } else {
            branches.push(
                Ok(
                    Branch(
                        (parsedBranchPattern as Ok<BranchPattern>).value,
                        (branchExpression as Ok<Expression>).value,
                        letBlock
                    )
                )
            );
        }
    }

    const errors = [ ];
    if (casePredicate.kind === "Err") errors.push(casePredicate.error);
    branches.forEach((branch, i) => {
        if (branch.kind === "Err") {
            errors.push(branch.error);
        } else {
            if (
                branch.value.pattern.kind === "Default" &&
                i < branches.length - 1
            ) {
                errors.push("default case must come last in the case..of");
            }
        }
    });

    if (errors.length > 0) {
        return Err(errors.join("\n"));
    }

    const validBranches = branches.map((value) => (value as Ok<Branch>).value);

    const needsDefault =
        validBranches.filter(
            (t) =>
                t.pattern.kind === "ListDestructure" ||
                t.pattern.kind === "EmptyList"
        ).length > 0;

    const hasDefault =
        validBranches.filter((t) => t.pattern.kind === "Default").length > 0;

    const hasWildcardDestructure =
        validBranches.filter(
            (t) =>
                t.pattern.kind === "ListDestructure" &&
                t.pattern.parts.length == 2 &&
                t.pattern.parts[0].kind === "Value" &&
                (t.pattern.parts[1].kind === "Value" ||
                    t.pattern.parts[1].kind === "EmptyList")
        ).length > 0;

    const hasEmptyList =
        validBranches.filter((t) => t.pattern.kind === "EmptyList").length > 0;

    const isSimpleDestructure = hasWildcardDestructure && hasEmptyList;

    if (needsDefault && !hasDefault && !isSimpleDestructure) {
        return Err(
            "You must provide a default case when using list destructoring"
        );
    }

    return Ok(
        CaseStatement((casePredicate as Ok<Expression>).value, validBranches)
    );
}

function parseAddition(tokens: Token[]): Result<string, Addition> {
    const operator = "+";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(Addition(left.value, right.value));
}

function parseSubtraction(tokens: Token[]): Result<string, Subtraction> {
    const operator = "-";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(Subtraction(left.value, right.value));
}

function parseMultiplcation(tokens: Token[]): Result<string, Multiplication> {
    const operator = "*";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(Multiplication(left.value, right.value));
}

function parseDivision(tokens: Token[]): Result<string, Division> {
    const operator = "/";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(Division(left.value, right.value));
}

function parseLeftPipe(tokens: Token[]): Result<string, LeftPipe> {
    const operator = "|>";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;
    if (!isLeftPipeableExpression(right.value))
        return Err(`Could not pipe to ${right.value}`);

    return Ok(LeftPipe(left.value, right.value));
}

function parseRightPipe(tokens: Token[]): Result<string, RightPipe> {
    const operator = "<|";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(RightPipe(left.value, right.value));
}

function parseModuleReference(
    tokens: Token[]
): Result<string, ModuleReference> {
    const body = tokensToString(tokens);
    const trimmedBody = body.trim();
    const firstPart = trimmedBody.split(" ")[0];
    const possibleModuleParts = firstPart.split(".");

    const moduleName = possibleModuleParts.slice(
        0,
        possibleModuleParts.length - 1
    );

    const value =
        possibleModuleParts[possibleModuleParts.length - 1] +
        " " +
        trimmedBody.split(" ").slice(1).join(" ");

    const expression = parseExpression(value, true);

    if (expression.kind === "Err") return expression;

    return Ok(
        ModuleReference(
            moduleName.length === 1 && moduleName[0].trim().length === 0
                ? [ ]
                : moduleName,
            expression.value
        )
    );
}

function parseFunctionCall(
    tokens: Token[]
): Result<string, FunctionCall | Constructor> {
    let functionName = null;
    let index = 0;

    while (index < tokens.length) {
        const token = tokens[index];
        if (token.kind === "WhitespaceToken") {
        } else if (token.kind === "IdentifierToken") {
            functionName = token.body;
            break;
        } else {
            return Err(
                `Expected identifier but got ${token.kind}: ${tokensToString([
                    token,
                ])}`
            );
        }
        index++;
    }
    index++;

    if (!functionName) {
        return Err(`Expected identifier but got nothing.`);
    }

    if (functionName[0].toUpperCase() === functionName[0]) {
        return parseConstructor(tokens);
    }

    while (index < tokens.length) {
        if (tokens[index].kind === "WhitespaceToken") {
            index++;
        } else {
            break;
        }
    }

    const args: string[] = [ ];
    let currentArg: string[] = [ ];
    let bracketDepth = 0;
    let colonDepth = 0;
    let curlyBracketDepth = 0;

    for (var i = index; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token.kind) {
            case "LiteralToken":
            case "StringToken":
            case "FormatStringToken":
            case "IdentifierToken": {
                if (currentArg.join().trim().length > 0) {
                    currentArg.push(token.body);
                } else {
                    if (bracketDepth === 0 && colonDepth === 0) {
                        args.push(currentArg.join(""));
                        args.push(token.body);
                        currentArg = [ ];
                    } else {
                        currentArg.push(token.body);
                    }
                }
                break;
            }
            case "OpenBracketToken": {
                if (bracketDepth === 0 && colonDepth === 0) {
                    if (currentArg.join().trim().length > 0) {
                        args.push(currentArg.join(""));
                    }
                    currentArg = [ ];
                } else {
                    currentArg.push("(");
                }

                bracketDepth++;
                break;
            }
            case "CloseBracketToken": {
                bracketDepth--;
                if (bracketDepth <= 0 && colonDepth === 0) {
                    args.push(currentArg.join(""));
                    currentArg = [ ];
                } else {
                    currentArg.push(")");
                }
                break;
            }
            case "OpenCurlyBracesToken": {
                curlyBracketDepth++;
                currentArg.push("{");
                break;
            }
            case "CloseCurlyBracesToken": {
                curlyBracketDepth--;
                currentArg.push("}");
                if (colonDepth > 0) colonDepth--;
                if (bracketDepth === 0 && curlyBracketDepth === 0) {
                    args.push(currentArg.join(""));
                    currentArg = [ ];
                }
                break;
            }
            case "ColonToken": {
                currentArg.push(":");
                colonDepth++;
                break;
            }
            case "CommaToken": {
                currentArg.push(",");
                if (colonDepth === 1) {
                    colonDepth--;
                }
                break;
            }
            case "OperatorToken": {
                currentArg.push(token.body);
                break;
            }
            case "WhitespaceToken": {
                currentArg.push(token.body);
                break;
            }
            case "ArrowToken": {
                currentArg.push("->");
                break;
            }
            case "KeywordToken": {
                currentArg.push(token.body);
                break;
            }
        }
    }

    if (currentArg.length > 0) {
        args.push(currentArg.join(""));
    }

    const parsedArgs = args
        .filter((arg) => arg.trim().length > 0)
        .map((arg) => {
            return parseExpression(arg);
        });

    const errors = parsedArgs.filter((arg) => arg.kind === "Err");

    if (errors.length > 0) {
        return Err(
            "Failed to parse function call due to:\n" +
                errors.map((error) => (error as Err<string>).error).join("\n")
        );
    }

    const correctArgs = parsedArgs
        .filter((arg) => arg.kind === "Ok")
        .map((arg) => (arg as Ok<Expression>).value);

    return Ok(FunctionCall(functionName, correctArgs));
}

function parseLambda(tokens: Token[]): Result<string, Lambda> {
    let index = 0;
    let isDone = false;
    const args = [ ];

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "IdentifierToken": {
                args.push(token.body);
                break;
            }

            case "ArrowToken": {
                isDone = true;
                break;
            }

            case "WhitespaceToken": {
                break;
            }
        }
        if (isDone) break;
        index++;
    }
    index++;

    // Looks like x + y
    const lambdaBody = tokensToString(tokens.slice(index));
    const parsedBody = parseExpression(lambdaBody);

    if (parsedBody.kind === "Err") {
        return Err(
            "Failed to parse lambda definiton due to:\n" + parsedBody.error
        );
    }

    return Ok(Lambda(args, parsedBody.value));
}

function parseOperator(
    operator: string,
    tokens: Token[]
): { left: Result<string, Expression>; right: Result<string, Expression> } {
    let seenOperator = false;
    let index = 0;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "OperatorToken": {
                if (token.body === operator) {
                    seenOperator = true;
                }
            }
        }

        if (seenOperator) break;
        index++;
    }

    const left = parseExpression(tokensToString(tokens.slice(0, index)));
    const right = parseExpression(tokensToString(tokens.slice(index + 1)));

    return { left, right };
}

type AllOperators = {
    kind: "AllOperators";
};

function AllOperators(): AllOperators {
    return {
        kind: "AllOperators",
    };
}

function hasTopLevelOperator(
    operator: string | AllOperators,
    tokens: Token[]
): boolean {
    let bracketDepth = 0;
    let curlyBracketDepth = 0;
    for (const token of tokens) {
        switch (token.kind) {
            case "OpenBracketToken": {
                bracketDepth++;
                break;
            }
            case "CloseBracketToken": {
                bracketDepth--;
                break;
            }
            case "OpenCurlyBracesToken": {
                curlyBracketDepth++;
                break;
            }
            case "CloseCurlyBracesToken": {
                curlyBracketDepth--;
                break;
            }
            case "OperatorToken": {
                if (bracketDepth === 0 && curlyBracketDepth === 0) {
                    if (
                        (typeof operator === "string" &&
                            token.body === operator) ||
                        (operator as AllOperators).kind === "AllOperators"
                    ) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function parseEquality(tokens: Token[]): Result<string, Equality> {
    const operator = "==";
    const { left, right } = parseOperator(operator, tokens);
    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(Equality(left.value, right.value));
}

function parseInEquality(tokens: Token[]): Result<string, InEquality> {
    const operator = "!=";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(InEquality(left.value, right.value));
}

function parseLessThan(tokens: Token[]): Result<string, LessThan> {
    const operator = "<";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(LessThan(left.value, right.value));
}

function parseLessThanOrEqual(
    tokens: Token[]
): Result<string, LessThanOrEqual> {
    const operator = "<=";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(LessThanOrEqual(left.value, right.value));
}

function parseGreaterThan(tokens: Token[]): Result<string, GreaterThan> {
    const operator = ">";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(GreaterThan(left.value, right.value));
}

function parseGreaterThanOrEqual(
    tokens: Token[]
): Result<string, GreaterThanOrEqual> {
    const operator = ">=";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(GreaterThanOrEqual(left.value, right.value));
}

function parseAnd(tokens: Token[]): Result<string, And> {
    const operator = "&&";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(And(left.value, right.value));
}

function parseOr(tokens: Token[]): Result<string, Or> {
    const operator = "||";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(Or(left.value, right.value));
}

function parseListPrepend(tokens: Token[]): Result<string, ListPrepend> {
    const operator = "::";
    const { left, right } = parseOperator(operator, tokens);

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    return Ok(ListPrepend(left.value, right.value));
}

function dropSurroundingBrackets(tokens: Token[]): Token[] {
    let start = 0;
    let end = tokens.length - 1;
    let seenOpen = false;

    while (start < tokens.length) {
        if (tokens[start].kind === "OpenBracketToken") {
            seenOpen = true;
            break;
        } else if (tokens[start].kind !== "WhitespaceToken") {
            break;
        }
        start++;
    }

    if (!seenOpen) return tokens;

    let seenClose = false;

    while (end > start) {
        if (tokens[end].kind === "CloseBracketToken") {
            seenClose = true;
            break;
        } else if (tokens[end].kind !== "WhitespaceToken") {
            break;
        }
        end--;
    }

    if (!seenClose) return tokens;

    return tokens.slice(start + 1, end);
}

function letAndDoErrorMessage(
    letIndex: number,
    inIndex: number,
    doIndex?: number,
    doReturnIndex?: number
): string | null {
    const isMissingLet = letIndex === -1;
    const isMissingIn = inIndex === -1;
    const hasCompleteLetIn =
        (!isMissingLet && !isMissingIn) || (isMissingLet && isMissingIn);
    const isMissingDo = doIndex === -1;
    const isMissingReturn = doReturnIndex === -1;
    const hasCompleteDoReturn =
        (!isMissingDo && !isMissingReturn) || (isMissingDo && isMissingReturn);

    if (hasCompleteLetIn && hasCompleteDoReturn) return null;

    if (!hasCompleteLetIn) {
        if (isMissingLet) {
            if (hasCompleteDoReturn) {
                return `Missing let before in.`;
            }
            if (isMissingDo) {
                return `Missing let before in, but found return without do. Did you mean to do let..in instead of in..return?`;
            }
            if (isMissingReturn) {
                return `Missing let before in, missing return after do. Did you mean to do let..in or do..return instead of do..in?`;
            }
        } else {
            if (hasCompleteDoReturn) {
                return `Missing in after let. let should be followed by in.`;
            }
            if (isMissingDo) {
                return `Missing in after let, but found return without do. Did you mean to do let..in or do..return instead of let..return?`;
            }
            if (isMissingReturn) {
                return `Missing in after let, missing return after do. let should be followed by in, and do followed by return.`;
            }
        }
    }

    if (!hasCompleteDoReturn) {
        if (isMissingDo) {
            return `Missing do before return.`;
        } else {
            return `Missing return after do.`;
        }
    }
    return null;
}

export function parseExpression(
    body: string,
    isModuleReference: boolean = false
): Result<string, Expression> {
    const preTokens = tokenize(body);
    const tokens =
        hasTopLevelOperator("\\", preTokens) ||
        hasTopLevelOperator("|>", preTokens)
            ? preTokens
            : dropSurroundingBrackets(preTokens);

    let index = 0;

    while (index < tokens.length) {
        if (tokens[index].kind !== "WhitespaceToken") break;
        index++;
    }

    const firstToken = tokens[index];
    if (!firstToken) {
        return Err(`Expected a token but got "${tokens}"`);
    }
    if (isModuleReference && firstToken.kind === "KeywordToken") {
        tokens[index] = IdentifierToken(firstToken.body);
    }

    const isKeyword = firstToken.kind === "KeywordToken";

    if (firstToken.kind === "OperatorToken" && firstToken.body === "\\") {
        return parseLambda(tokens);
    } else if (!isKeyword && hasTopLevelOperator("|>", tokens)) {
        return parseLeftPipe(tokens);
    } else if (!isKeyword && hasTopLevelOperator("<|", tokens)) {
        return parseRightPipe(tokens);
    }

    switch (firstToken.kind) {
        case "KeywordToken": {
            if (firstToken.body === "if") {
                return parseIfStatement(body);
            } else if (firstToken.body === "case") {
                return parseCaseStatement(body);
            }
            break;
        }
        case "OperatorToken": {
            if (firstToken.body === "\\") {
                return parseLambda(tokens);
            }
            break;
        }
        case "OpenCurlyBracesToken": {
            if (hasTopLevelOperator("::", tokens)) {
                return parseListPrepend(tokens);
            }

            const tokensOtherThanWhitespace = tokens
                .slice(index + 1)
                .filter((token) => token.kind !== "WhitespaceToken");

            if (
                tokensOtherThanWhitespace.filter(
                    (token) =>
                        token.kind === "IdentifierToken" ||
                        token.kind === "CommaToken" ||
                        token.kind === "CloseCurlyBracesToken"
                ).length === tokensOtherThanWhitespace.length
            ) {
            }

            return parseObjectLiteral(tokens);
        }
        case "IdentifierToken": {
            if (hasTopLevelOperator(AllOperators(), tokens)) {
                break;
            }

            const tokensOtherThanWhitespace = tokens
                .slice(index + 1)
                .filter((token) => token.kind !== "WhitespaceToken");

            if (firstToken.body.indexOf(".") > -1) {
                const possibleModuleParts = firstToken.body.split(".");

                if (possibleModuleParts.length > 1) {
                    if (hasTopLevelOperator("::", tokens)) {
                        return parseListPrepend(tokens);
                    }
                    return parseModuleReference(tokens.slice(index));
                }
            }
            if (tokensOtherThanWhitespace.length > 0) {
                if (hasTopLevelOperator("::", tokens)) {
                    return parseListPrepend(tokens);
                }
                return parseFunctionCall(tokens.slice(index));
            }

            break;
        }
    }

    if (hasTopLevelOperator("==", tokens)) {
        return parseEquality(tokens);
    } else if (hasTopLevelOperator("!=", tokens)) {
        return parseInEquality(tokens);
    } else if (hasTopLevelOperator("<", tokens)) {
        return parseLessThan(tokens);
    } else if (hasTopLevelOperator("<=", tokens)) {
        return parseLessThanOrEqual(tokens);
    } else if (hasTopLevelOperator(">", tokens)) {
        return parseGreaterThan(tokens);
    } else if (hasTopLevelOperator(">=", tokens)) {
        return parseGreaterThanOrEqual(tokens);
    } else if (hasTopLevelOperator("&&", tokens)) {
        return parseAnd(tokens);
    } else if (hasTopLevelOperator("||", tokens)) {
        return parseOr(tokens);
    } else if (hasTopLevelOperator("::", tokens)) {
        return parseListPrepend(tokens);
    } else if (hasTopLevelOperator("+", tokens)) {
        return parseAddition(tokens);
    } else if (hasTopLevelOperator("-", tokens)) {
        return parseSubtraction(tokens);
    } else if (hasTopLevelOperator("*", tokens)) {
        return parseMultiplcation(tokens);
    } else if (hasTopLevelOperator("/", tokens)) {
        return parseDivision(tokens);
    }

    let isDone = false;
    while (index < tokens.length) {
        const token = tokens[index];
        isDone = true;
        switch (token.kind) {
            case "ArrowToken": {
                break;
            }
            case "AssignToken": {
                break;
            }
            case "CloseBracketToken": {
                break;
            }
            case "CloseCurlyBracesToken": {
                break;
            }
            case "ColonToken": {
                break;
            }
            case "CommaToken": {
                break;
            }
            case "FormatStringToken": {
                return parseFormatStringValue(tokens.slice(index));
            }
            case "IdentifierToken": {
                break;
            }
            case "KeywordToken": {
                break;
            }
            case "LiteralToken": {
                if (token.body.startsWith("[")) {
                    if (listRangeDotsNotWithinString(tokens)) {
                        return parseListRange(tokens);
                    }
                    return parseListValue(tokens);
                }
                break;
            }
            case "OpenBracketToken": {
                break;
            }
            case "OpenCurlyBracesToken": {
                break;
            }
            case "OperatorToken": {
                if (token.body === "\\") {
                    return parseLambda(tokens.slice(index));
                }
                break;
            }
            case "PipeToken": {
                break;
            }
            case "StringToken": {
                return parseStringValue(tokens.slice(index));
            }
            case "WhitespaceToken": {
                index++;
                isDone = false;
                break;
            }
        }

        if (isDone) break;
    }

    const trimmedBody = body.trim();
    if (
        trimmedBody.split(" ").length === 1 ||
        !isNaN(parseInt(trimmedBody, 10))
    ) {
        return parseValue(tokens);
    } else {
        const firstPart = trimmedBody.split(" ")[0];
        const possibleModuleParts = firstPart.split(".");

        if (possibleModuleParts.length > 1) {
            return parseModuleReference(tokens);
        }

        const firstChar = trimmedBody.slice(0, 1);
        if (firstChar.toUpperCase() === firstChar) {
            return parseConstructor(tokens);
        }

        if (trimmedBody.split(" ").length > 1) {
            return parseFunctionCall(tokens);
        }
    }

    return Err(`No expression found: '${body}'`);
}

function parseDoBlock(tokens: Token[]): Result<string, DoBlock> {
    const expressions: Result<string, DoExpression>[] = [ ];

    let currentBuffer = [ ];
    function parseDoExpression(currentBuffer: Token[]) {
        const asString = tokensToString(currentBuffer);
        const asBlock = intoBlocks(asString);

        if (asBlock.length > 0 && asBlock[0].kind !== "UnknownBlock") {
            for (const block of asBlock) {
                if (block.kind === "CommentBlock") {
                    continue;
                }

                if (
                    block.kind === "ConstBlock" ||
                    block.kind === "FunctionBlock"
                ) {
                    expressions.push(
                        parseBlock(block) as Result<string, Const | Function>
                    );
                } else {
                    expressions.push(
                        Err(`Got unexpected block in do: ${block.kind}`)
                    );
                }
            }
        } else {
            const expression = parseExpression(tokensToString(currentBuffer));

            if (
                expression.kind === "Ok" &&
                (expression.value.kind === "FunctionCall" ||
                    expression.value.kind === "ModuleReference")
            ) {
                expressions.push(
                    expression as Result<string, FunctionCall | ModuleReference>
                );
            }

            if (expression.kind === "Err") {
                expressions.push(expression);
            }
        }
    }

    for (const token of tokens.slice(1)) {
        switch (token.kind) {
            case "IdentifierToken": {
                currentBuffer.push(token);
                break;
            }
            case "StringToken": {
                currentBuffer.push(token);
                break;
            }
            case "WhitespaceToken": {
                if (token.body.indexOf("\n\n") > -1) {
                    parseDoExpression(currentBuffer);
                    currentBuffer = [ ];
                } else {
                    currentBuffer.push(token);
                }
                break;
            }
            default: {
                currentBuffer.push(token);
                break;
            }
        }
    }

    if (currentBuffer.length > 0) {
        parseDoExpression(currentBuffer);
    }

    const errors = expressions
        .filter((e) => e.kind === "Err")
        .map((e) => (e as Err<string>).error)
        .join("\n");

    if (errors) {
        return Err(errors);
    }

    const values = expressions
        .filter((e) => e.kind === "Ok")
        .map((e) => (e as Ok<DoExpression>).value);

    return Ok(DoBlock(values));
}

function isTokenAtIndentLevel(
    currentToken: Token,
    previousToken: Token,
    tokenName: string,
    level: number
): boolean {
    if (previousToken.kind === "WhitespaceToken") {
        const lineSplits = previousToken.body.split("\n");
        const endsWithFourIndents =
            lineSplits[lineSplits.length - 1] === " ".repeat(level);
        return (
            currentToken.kind === "KeywordToken" &&
            currentToken.body === tokenName &&
            endsWithFourIndents
        );
    }

    return false;
}

function parseFunction(tokens: Token[]): Result<string, Function> {
    if (tokens[0].kind !== "IdentifierToken") {
        return Err("Expected identfier, got " + tokens[0].kind);
    }

    const functionName = tokens[0].body;
    let index = 1;

    while (index < tokens.length) {
        if (tokens[index].kind === "WhitespaceToken") {
        } else if (tokens[index].kind !== "ColonToken") {
            return Err("Expected `:`, got " + tokens[index].kind);
        } else if (tokens[index].kind === "ColonToken") {
            break;
        }

        index++;
    }

    const doIndex = tokens.findIndex(
        (t) => t.kind === "KeywordToken" && t.body === "do"
    );

    const doReturnIndex = tokens.findIndex(
        (t) => t.kind === "KeywordToken" && t.body === "return"
    );

    const doBody =
        doIndex > -1
            ? parseDoBlock(tokens.slice(doIndex + 1, doReturnIndex))
            : undefined;

    index++;
    const lastIndex = index;
    let currentType: Token[] = [ ];
    let isDone = false;

    while (index < tokens.length) {
        const token = tokens[index];
        const previousToken = index > lastIndex ? tokens[index - 1] : null;

        switch (token.kind) {
            case "IdentifierToken": {
                if (
                    previousToken &&
                    previousToken.kind === "WhitespaceToken" &&
                    previousToken.body.indexOf("\n") > -1
                ) {
                    isDone = true;
                } else {
                    currentType.push(token);
                }
                break;
            }

            default: {
                currentType.push(token);
            }
        }

        if (isDone) break;
        index++;
    }

    if (doIndex > -1) {
        index = doReturnIndex + 1;
    }

    const tokenizedTypes = tokenizeType(currentType);

    if (tokenizedTypes.kind === "Err") return tokenizedTypes;
    const types = tokenizedTypes.value;

    const letStart = tokens.findIndex((t, i) => {
        const previous = tokens[i - 1];
        if (!previous) return false;
        return isTokenAtIndentLevel(t, previous, "let", 4);
    });
    const letEnd = tokens.findIndex((t, i) => {
        const previous = tokens[i - 1];
        if (!previous) return false;

        return isTokenAtIndentLevel(t, previous, "in", 4);
    });

    const maybeLetAndDoErrorMessage = letAndDoErrorMessage(
        letStart,
        letEnd,
        doIndex,
        doReturnIndex
    );
    if (maybeLetAndDoErrorMessage) return Err(maybeLetAndDoErrorMessage);

    let letBlock: Block[] = [ ];

    if (letStart > -1 && letEnd > -1) {
        const firstPastWhitespace = tokens
            .slice(letStart + 1)
            .findIndex((t) => t.kind !== "WhitespaceToken");

        const letTokens = tokens.slice(
            letStart + firstPastWhitespace + 1,
            letEnd
        );

        const letLines = (" ".repeat(8) + tokensToString(letTokens))
            .split("\n")
            .map((line) => line.slice(8));
        const letBlocks = intoBlocks(letLines.join("\n"));

        letBlock = letBlocks
            .map(parseBlock)
            .filter((block) => block.kind === "Ok")
            .map((block) => (block as Ok<Block>).value);
    }

    const argumentLine = tokensToString(tokens.slice(lastIndex)).split("\n")[1];
    if (!argumentLine) {
        return Err(`No arguments found in function definition.
Functions should look like:
\`\`\`
foo: string -> string
foo name =
    "Hi! " + name
\`\`\`
But I seemed to only find the \`foo: string -> string\` line.
`);
    }
    const argumentNames = argumentLine
        .slice(functionName.length)
        .split("=")[0]
        .split(" ")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const combinedArguments: Result<string, FunctionArgsUnion>[] = types
        .slice(0, types.length - 1)
        .map((type_, i) => {
            if (argumentNames.length <= i) {
                const parsedType = parseRootTypeTokens(type_);
                if (parsedType.kind === "Err")
                    return Err(
                        `Failed to parse argument ${i} due to ${parsedType.error}`
                    );

                return Ok(AnonFunctionArg(i, parsedType.value));
            } else {
                const name = argumentNames[i];
                const parsedType = parseRootTypeTokens(type_);
                if (parsedType.kind === "Err")
                    return Err(
                        `Failed to parse ${name} due to ${parsedType.error}`
                    );

                return Ok(FunctionArg(name, parsedType.value));
            }
        });

    const returnParts = types[types.length - 1];
    const returnType = parseRootTypeTokens(returnParts);

    let bodyStart = tokens.findIndex((t) => t.kind === "AssignToken") + 1;
    let body: string[] = tokensToString(tokens.slice(bodyStart)).split("\n");
    if (letEnd > -1) {
        body = tokensToString(tokens.slice(letEnd + 1)).split("\n");
    }
    if (doIndex > -1) {
        bodyStart = doReturnIndex + 1;
        body = tokensToString(tokens.slice(bodyStart)).split("\n");
    }

    const parsedBody = parseExpression(body.join("\n"));

    if (parsedBody.kind === "Err") {
        return Err(`Failed to parse function body due to ${parsedBody.error}`);
    }
    if (returnType.kind === "Err") {
        return Err(
            `Failed to parse function return type due to ${returnType.error}`
        );
    }
    if (doBody !== undefined && doBody.kind === "Err") return doBody;

    for (const arg of combinedArguments) {
        if (arg.kind === "Err") return arg;
    }

    return Ok(
        Function(
            functionName,
            returnType.value,
            combinedArguments.map((arg) => (arg as Ok<FunctionArg>).value),
            letBlock,
            parsedBody.value,
            doBody === undefined ? undefined : (doBody as Ok<DoBlock>).value
        )
    );
}

function parseConst(tokens: Token[]): Result<string, Const> {
    if (tokens[0].kind !== "IdentifierToken") {
        return Err("Expected identfier, got " + tokens[0].kind);
    }

    const constName = tokens[0].body;
    let index = 1;

    // move parser past colon
    while (index < tokens.length) {
        const token = tokens[index];
        if (token.kind === "WhitespaceToken") {
        } else if (token.kind !== "ColonToken") {
            return Err("Expected `:`, got " + token.kind);
        } else if (token.kind === "ColonToken") {
            break;
        }

        index++;
    }
    index++;

    let constType: Token[] = [ ];
    let isDoneReadingType = false;

    while (index < tokens.length) {
        const token = tokens[index];

        switch (token.kind) {
            case "WhitespaceToken": {
                if (token.body.indexOf("\n") > -1) {
                    isDoneReadingType = true;
                    break;
                }
                break;
            }

            case "IdentifierToken": {
                constType.push(token);
                break;
            }

            case "OpenBracketToken": {
                constType.push(token);
                break;
            }

            case "CloseBracketToken": {
                constType.push(token);
                break;
            }
        }

        if (isDoneReadingType) break;
        index++;
    }
    index++;

    let bodyParts = tokens.slice(index);
    let block = tokensToString(bodyParts);
    const lines = block.split("\n");

    const letStart = lines.findIndex(
        (line) => line.startsWith("    let") && line.endsWith("let")
    );
    const letEnd = lines.findIndex(
        (line) => line.startsWith("    in") && line.endsWith("in")
    );

    const maybeLetAndDoErrorMessage = letAndDoErrorMessage(letStart, letEnd);
    if (maybeLetAndDoErrorMessage) return Err(maybeLetAndDoErrorMessage);

    let letBlock: Block[] = [ ];

    if (letStart > -1 && letEnd > -1) {
        const letLines = lines
            .slice(letStart + 1, letEnd)
            .map((line) => line.slice(8));
        const letBlocks = intoBlocks(letLines.join("\n"));

        letBlock = letBlocks
            .map(parseBlock)
            .filter((block) => block.kind === "Ok")
            .map((block) => (block as Ok<Block>).value);
    }

    const parsedType = parseType(constType);

    const body = [ ];
    const split = block.split("\n");
    const start = letEnd > -1 ? letEnd + 1 : 0;
    let seenEquals = false;
    for (let i = start; i < split.length; i++) {
        if (seenEquals) {
            body.push(split[i]);
        } else {
            if (split[i].indexOf("=") === -1) {
                body.push(split[i]);
            } else {
                body.push(split[i].split("=").slice(1).join("="));
                seenEquals = true;
            }
        }
    }

    const parsedBody = parseExpression(body.join("\n"));

    if (parsedBody.kind === "Err") {
        return mapError(
            (error) => `Failed to parse body due to ${error}`,
            parsedBody
        );
    }
    if (parsedType.kind === "Err") {
        return mapError(
            (error) => `Failed to parse type due to ${error}`,
            parsedType
        );
    }

    return Ok(Const(constName, parsedType.value, letBlock, parsedBody.value));
}

function parseImport(tokens: Token[]): Result<string, Import> {
    const imports = [ ];
    let isInExposing = false;
    let isInAlias = false;

    let moduleName = "";
    let alias: Maybe<string> = Nothing();
    const exposing = [ ];

    for (var i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token.kind) {
            case "KeywordToken": {
                if (token.body === "import") {
                    continue;
                } else if (token.body === "exposing") {
                    isInExposing = true;
                } else if (token.body === "as") {
                    isInExposing = false;
                    isInAlias = true;
                } else {
                    return Err("Expected `import` but got " + token.body);
                }
                break;
            }

            case "StringToken":
            case "IdentifierToken": {
                if (isInExposing) {
                    exposing.push(token.body);
                } else if (isInAlias) {
                    alias = Just(token.body);
                } else {
                    moduleName = token.body;
                }
                break;
            }

            case "WhitespaceToken":
            case "CommaToken":
            case "OpenBracketToken":
            case "CloseBracketToken": {
                continue;
            }

            default: {
                return Err("Expected `import` but got " + token.kind);
            }
        }
    }

    const namespace = moduleName.startsWith('"') ? "Relative" : "Global";

    imports.push(ImportModule(moduleName, alias, exposing, namespace));

    return Ok(Import(imports));
}

function parseExport(tokens: Token[]): Result<string, Export> {
    const exports = [ ];
    for (var i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        switch (token.kind) {
            case "KeywordToken": {
                if (token.body === "exposing") {
                    continue;
                } else {
                    return Err("Expected `exposing` but got " + token.body);
                }
            }

            case "IdentifierToken": {
                exports.push(token.body);
            }

            case "WhitespaceToken":
            case "OpenBracketToken":
            case "CloseBracketToken":
            case "CommaToken": {
                continue;
            }

            default: {
                return Err("Expected `exposing` but got " + token.kind);
            }
        }
    }

    return Ok(Export(exports));
}

function parseComment(tokens: Token[]): Comment {
    return Comment(tokensToString(tokens.slice(1)).trim());
}

function parseMultilineComment(tokens: Token[]): MultilineComment {
    return MultilineComment(tokensToString(tokens.slice(1, -2)).trim());
}

export function parseBlock(block: UnparsedBlock): Result<string, Block> {
    const wrapError = (res: Result<string, Block>) => {
        return mapError((err) => {
            return `Line ${block.lineStart}: ${err}
\`\`\`
${block.lines.join("\n")}
\`\`\``;
        }, res);
    };

    const tokens = stripComments(tokenize(block.lines.join("\n")));

    switch (block.kind) {
        case "ImportBlock": {
            return wrapError(parseImport(tokens));
        }
        case "ExportBlock": {
            return wrapError(parseExport(tokens));
        }
        case "UnionTypeBlock": {
            return wrapError(parseUnionType(tokens));
        }
        case "TypeAliasBlock": {
            return wrapError(parseTypeAlias(tokens));
        }
        case "FunctionBlock": {
            return wrapError(parseFunction(tokens));
        }
        case "ConstBlock": {
            return wrapError(parseConst(tokens));
        }
        case "CommentBlock": {
            return Ok(parseComment(tokenize(block.lines.join("\n"))));
        }
        case "MultilineCommentBlock": {
            return Ok(parseMultilineComment(tokenize(block.lines.join("\n"))));
        }
        case "UnknownBlock": {
            return Err(
                `Not sure what the block starting on line ${
                    block.lineStart
                } is. There's something wrong with the lines ${
                    block.lineStart
                } - ${block.lineStart + block.lines.length}:
\`\`\`
${block.lines.join("\n")}
\`\`\``
            );
        }
    }
}

export function stripComments(tokens: Token[]): Token[] {
    const returnTokens = [ ];
    let isInComment = false;
    let isInMultilineComment = false;

    for (const token of tokens) {
        if (isInComment) {
            if (token.kind === "WhitespaceToken") {
                if (token.body.indexOf("\n") > -1) {
                    isInComment = false;
                    returnTokens.push(token);
                }
            }
        } else if (isInMultilineComment) {
            if (token.kind === "MultilineCommentToken") {
                isInMultilineComment = false;
            }
        } else {
            if (token.kind === "CommentToken") {
                isInComment = true;
            } else if (token.kind === "MultilineCommentToken") {
                isInMultilineComment = true;
            } else {
                returnTokens.push(token);
            }
        }
    }

    return returnTokens;
}

function getGap(blocks: UnparsedBlock[], index: number): string {
    const rawBlock = blocks[index];
    const lineEnd = rawBlock.lineStart + rawBlock.lines.length;
    return `${blocks[index].lineStart} - ${lineEnd}`;
}

function reportBlock(block: UnparsedBlock): string {
    return `
\`\`\`
${block.lines.join("\n")}
\`\`\``.trim();
}

export function parse(body: string, filename: string = "main"): Module {
    const blocks = intoBlocks(body);
    const syntax = blocks.map(parseBlock);
    const errors = syntax
        .filter((syn) => syn.kind === "Err")
        .map((syn) => (syn as Err<string>).error);
    const successes = syntax
        .filter((syn) => syn.kind === "Ok")
        .map((syn) => (syn as Ok<Block>).value);

    const imports: Import[] = syntax
        .filter((syn) => syn.kind === "Ok" && syn.value.kind === "Import")
        .map((syn) => syn.kind === "Ok" && syn.value) as Import[];

    const typeErrors = syntax
        .map((resultBlock, index) => {
            if (resultBlock.kind === "Err") return null;

            const block = resultBlock as Ok<Block>;
            const validatedType = validateType(
                block.value,
                typeBlocks(
                    [ ...syntax.slice(0, index), ...syntax.slice(index) ]
                        .filter((b) => b.kind === "Ok")
                        .map((b) => (b as Ok<Block>).value)
                ),
                imports
            );
            const gap = getGap(blocks, index);

            return mapError(
                (error) =>
                    `Error on lines ${gap}\n${error}:
${reportBlock(blocks[index])}`,
                validatedType
            );
        })
        .filter((type) => type && type.kind === "Err")
        .map((type) => (type as Err<string>).error);

    const collidingNames = collisions(successes).map(({ indexes, name }) => {
        const definitions = indexes.map((index) => {
            const gap = getGap(blocks, index);

            return `${gap}:
${reportBlock(blocks[index])}`;
        });

        return `
The name \`${name}\` has been used for different things.
${definitions.join("\n\n")}
        `.trim();
    });

    const moduleName = filename;

    return Module(
        moduleName,
        syntax
            .filter((syn) => syn.kind === "Ok")
            .map((syn) => (syn as Ok<any>).value),
        [ ...errors, ...typeErrors, ...collidingNames ]
    );
}

export function addTypeErrors(
    module: ContextModule,
    otherModules: ContextModule[]
): ContextModule {
    const imports: Import[] = module.body.filter(
        (syn) => syn.kind === "Import"
    ) as Import[];

    let allOtherTypeBlocks: TypedBlock[] = [ ];

    for (const other of otherModules) {
        allOtherTypeBlocks = allOtherTypeBlocks.concat(typeBlocks(other.body));
    }

    const typeErrors = module.body
        .map((block, index) => {
            const validatedType = validateType(
                block,
                [
                    ...typeBlocks([
                        ...module.body.slice(0, index),
                        ...module.body.slice(index),
                    ]),
                    ...allOtherTypeBlocks,
                ],

                imports
            );
            const gap = getGap(module.unparsedBody, index);

            return mapError(
                (error) =>
                    `Error on lines ${gap}\n${error}:
${reportBlock(module.unparsedBody[index])}`,
                validatedType
            );
        })
        .filter((type) => type && type.kind === "Err")
        .map((type) => (type as Err<string>).error);

    module.errors = module.errors.concat(typeErrors);
    return module;
}

export function parseWithContext(
    body: string,
    filename: string = "main"
): ContextModule {
    const blocks = intoBlocks(body);
    const syntax = blocks.map(parseBlock);
    const errors = syntax
        .filter((syn) => syn.kind === "Err")
        .map((syn) => (syn as Err<string>).error);
    const successes = syntax
        .filter((syn) => syn.kind === "Ok")
        .map((syn) => (syn as Ok<Block>).value);

    const collidingNames = collisions(successes).map(({ indexes, name }) => {
        const definitions = indexes.map((index) => {
            const gap = getGap(blocks, index);

            return `${gap}:
${reportBlock(blocks[index])}`;
        });

        return `
The name \`${name}\` has been used for different things.
${definitions.join("\n\n")}
        `.trim();
    });

    const moduleName = filename;

    return ContextModule(
        moduleName,
        syntax
            .filter((syn) => syn.kind === "Ok")
            .map((syn) => (syn as Ok<any>).value),
        blocks,
        [ ...errors, ...collidingNames ]
    );
}
