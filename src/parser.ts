import {
    Err,
    mapError,
    Ok,
    Result,
} from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks } from "./blocks";
import { isBuiltinType } from "./builtins";
import { collisions } from "./collisions";
import {
    Addition,
    And,
    AnonFunctionArg,
    Block,
    Branch,
    CaseStatement,
    Const,
    Constructor,
    Destructure,
    Division,
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
    GenericType,
    GreaterThan,
    GreaterThanOrEqual,
    IfStatement,
    Import,
    InEquality,
    isLeftPipeableExpression,
    Lambda,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListRange,
    ListValue,
    Module,
    ModuleReference,
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
    UnionType,
    UnparsedBlock,
    Value,
} from "./types";
import { validateType } from "./type_checking";

function parseType(line: string): Result<string, Type> {
    const rootTypeName = line.split(" ")[0];
    if (rootTypeName.length === 0) {
        return Err(`Missing type definition. Got: \`${line}\``);
    }

    if (isBuiltinType(rootTypeName)) {
        return Ok(FixedType(rootTypeName, [ ]));
    } else if (rootTypeName.toLowerCase() === rootTypeName) {
        return Ok(GenericType(rootTypeName));
    }

    const typeArguments = line.split(" ").slice(1);
    const types = typeArguments.join(" ").trim();
    const parsedTypes = [ ];
    let buffer = "";
    let bracketDepth = 0;

    for (var i = 0; i < types.length; i++) {
        const char = types[i];

        if (char === "(") {
            bracketDepth += 1;
            if (bracketDepth > 1) buffer += char;
        } else if (char === ")") {
            bracketDepth -= 1;
            if (bracketDepth === 0) {
                parsedTypes.push(parseType(buffer));
                buffer = "";
            } else {
                buffer += char;
            }
        } else if (char === " ") {
            if (bracketDepth == 0) {
                parsedTypes.push(parseType(buffer));
                buffer = "";
            } else {
                buffer += char;
            }
        } else {
            buffer += char;
        }
    }

    if (buffer.length > 0) {
        parsedTypes.push(parseType(buffer));
    }

    return Ok(
        FixedType(
            rootTypeName,
            parsedTypes
                .filter((type_) => type_.kind !== "err")
                .map((type_) => (type_ as Ok<Type>).value)
        )
    );
}

function parseUnionType(block: string): Result<string, UnionType> {
    // get the List a from
    // type List a = ...
    const typeParts = block.split("=")[0].slice(4).trim();
    const parsedType = parseType(typeParts);

    if (parsedType.kind === "err") return parsedType;

    // anything after the =, split based on pipes
    const tagParts = block.split("=").slice(1).join("=").split("|");

    const tags: Result<string, Tag>[] = tagParts.map((tag) => {
        if (tag.startsWith("|")) {
            tag = tag.slice(1);
        }
        tag = tag.trim();

        const tagName = tag.split(" ")[0];
        if (tagName.length === 0) {
            return Err(
                `Missing expected tag name for union type \`${typeParts}\``
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
                // name: type
                const split = arg.split(":");
                const splitTypes = split[1].trim().split(" ");
                const typeName = splitTypes[0];
                const typeArguments = splitTypes
                    .slice(1)
                    .map((name) => parseType(name))
                    .filter((type_) => type_.kind !== "err")
                    .map((type_) => (type_ as Ok<Type>).value);

                const type_ = parseType(splitTypes.join(" "));

                if (type_.kind === "err") return type_;
                return Ok(TagArg(split[0].trim(), type_.value));
            });

        if (
            args.filter((maybeTag) => maybeTag.kind === "ok").length ===
            args.length
        ) {
            return Ok(
                Tag(
                    tagName,
                    args.map((arg) => (arg as Ok<TagArg>).value)
                )
            );
        }

        return Err("Error parsing args");
    });

    if (tags.length === 0) {
        return Err("Not enough tags given.");
    }

    for (var i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag.kind === "err") {
            return tag;
        }
    }
    return Ok(
        UnionType(
            parsedType.value,
            tags
                .filter((tag) => tag.kind === "ok")
                .map((tag) => (tag as Ok<Tag>).value)
        )
    );
}

function parseProperty(block: string): Result<string, Property> {
    const name = block.split(":")[0].trim();

    const bitsAfterName = block.split(":").slice(1).join(":");

    const bitsBeforeFinalComma =
        bitsAfterName.indexOf(",") > -1
            ? bitsAfterName.split(",").slice(0, -1).join(",").trim()
            : bitsAfterName.trim();

    const type = parseType(bitsBeforeFinalComma);

    if (type.kind === "err") return type;
    return Ok(Property(name, type.value));
}

function isRootProperty(line: string): boolean {
    if (line.match(/    .+/)) {
        return true;
    }
    return false;
}

function parseTypeAlias(block: string): Result<string, TypeAlias> {
    const parsedAliasName = parseType(
        block.split("=")[0].slice("type alias".length).trim()
    );

    if (parsedAliasName.kind === "err") {
        return parsedAliasName;
    }

    const aliasName = parsedAliasName.value;

    const recordDefinition = block.split("=").slice(1).join("=");

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

        if (isOpeningBrace || isClosingBrace) {
            return;
        }

        const hasInlineOpeningBrace = line.trim().startsWith("{") && i === 0;

        if (hasInlineOpeningBrace) {
            line = line.trim().slice(1);
        }

        const hasInlineClosingBrace =
            line.trim().endsWith("}") && i === line.length - 1;

        if (hasInlineClosingBrace) {
            line = line.trim().slice(0, -1);
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

    const parsedProperties = properties.map(parseProperty);
    const errors = parsedProperties.filter(
        (property: Result<string, Property>) => property.kind === "err"
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

    return Ok(
        TypeAlias(
            aliasName,
            parsedProperties.map((property) => (property as Ok<Property>).value)
        )
    );
}

function parseObjectLiteral(body: string): Result<string, ObjectLiteral> {
    const fields: Field[] = [ ];

    let currentName = "";
    let currentValue: Expression | null = null;
    let objectDepth = 0;
    let innermostBuffer = "";

    let isInName = false;

    for (var i = 0; i < body.length; i++) {
        const currentChar = body[i];

        if (currentChar === "{") {
            objectDepth++;
            isInName = true;
        } else if (currentChar === "}") {
            if (objectDepth === 1) {
                const innerLiteral = parseExpression(innermostBuffer);
                if (innerLiteral.kind === "err") return innerLiteral;
                innermostBuffer = "";
                currentValue = innerLiteral.value;

                fields.push(Field(currentName.trim(), currentValue));
                currentName = "";
                currentValue = null;
            }
            objectDepth--;
        } else if (currentChar === ":") {
            isInName = false;
        } else if (currentChar === ",") {
            if (objectDepth > 1) {
                innermostBuffer += currentChar;
            } else {
                const innerLiteral = parseExpression(innermostBuffer);
                if (innerLiteral.kind === "err") return innerLiteral;
                fields.push(Field(currentName.trim(), innerLiteral.value));
                innermostBuffer = "";
                currentName = "";
                isInName = true;
            }
        } else {
            if (isInName) {
                currentName += currentChar;
            } else {
                innermostBuffer += currentChar;
            }
        }
    }

    return Ok(ObjectLiteral(fields));
}

function parseValue(body: string): Result<string, Value> {
    const trimmed = body.trim();

    if (trimmed.split(" ").length > 1) {
        return Err(`Too many values: ${trimmed}`);
    } else {
        return Ok(Value(trimmed));
    }
}

function parseStringValue(body: string): Result<string, StringValue> {
    const trimmed = body.trim();
    const parts = trimmed.split('"').filter((part) => part.length > 0);

    if (parts.length > 1) {
        return Err(`Too many values: ${trimmed}`);
    } else if (parts.length === 0) {
        return Ok(StringValue(""));
    } else {
        return Ok(StringValue(parts[0]));
    }
}

function parseListRange(body: string): Result<string, ListRange> {
    const trimmed = body.trim().slice(1).slice(0, -1);
    const pieces = trimmed.split("..");
    const start = parseValue(pieces[0]);
    const end = parseValue(pieces[1]);

    if (start.kind === "err") return start;
    if (end.kind === "err") return end;

    return Ok(ListRange(start.value, end.value));
}

function parseListValue(body: string): Result<string, ListValue> {
    const trimmed = body.trim();
    const innerBody = trimmed.slice(1, trimmed.length - 1).trim();
    const parsedValues = [ ];
    let bracketDepth = 0;
    let buffer = "";

    for (var i = 0; i < innerBody.length; i++) {
        const char = innerBody[i];

        if (char === "[") {
            bracketDepth += 1;
            if (bracketDepth > 0) buffer += char;
        } else if (char === "]") {
            bracketDepth -= 1;
            buffer += char;
            if (bracketDepth === 0) {
                parsedValues.push(parseExpression(buffer));
                buffer = "";
            }
        } else if (char === ",") {
            if (bracketDepth == 0) {
                if (buffer.trim().length > 0) {
                    parsedValues.push(parseExpression(buffer));
                }
                buffer = "";
            } else {
                buffer += char;
            }
        } else {
            buffer += char;
        }
    }

    if (buffer.length > 0) {
        parsedValues.push(parseExpression(buffer));
    }

    const errors = parsedValues.filter((part) => part.kind === "err");
    const passedValues = parsedValues.filter((part) => part.kind === "ok");

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
    body: string
): Result<string, FormatStringValue> {
    const trimmed = body.trim();
    const parts = trimmed.split("`").filter((part) => part.length > 0);

    if (parts.length > 1) {
        return Err(`Too many values: ${trimmed}`);
    } else if (parts.length === 0) {
        return Ok(FormatStringValue(""));
    } else {
        return Ok(FormatStringValue(parts[0]));
    }
}

function parseDestructure(body: string): Result<string, Destructure> {
    body = body.trim();
    const constructor = body.split(" ")[0];
    const pattern = body.split(" ").slice(1).join(" ");

    return Ok(Destructure(constructor, pattern));
}

function parseConstructor(body: string): Result<string, Constructor> {
    body = body.trim();
    const constructor = body.split(" ")[0];
    const pattern = body.split(" ").slice(1).join(" ");

    return Ok(Constructor(constructor, pattern));
}

function parseIfStatementSingleLine(body: string): Result<string, IfStatement> {
    const predicate = body.split("then")[0].split("if")[1];
    const ifBody = body.split("then")[1].split("else")[0];
    const elseBody = body.split("else")[1];

    const parsedPredicate = parseExpression(predicate);
    const parsedIfBody = parseExpression(ifBody);
    const parsedElseBody = parseExpression(elseBody);

    const errors = [ ];
    if (parsedPredicate.kind === "err") errors.push(parsedPredicate.error);
    if (parsedIfBody.kind === "err") errors.push(parsedIfBody.error);
    if (parsedElseBody.kind === "err") errors.push(parsedElseBody.error);

    if (errors.length > 0) {
        return Err(errors.join("\n"));
    }

    return Ok(
        IfStatement(
            (parsedPredicate as Ok<Expression>).value,
            (parsedIfBody as Ok<Expression>).value,
            (parsedElseBody as Ok<Expression>).value
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
    const predicateWords = lines[0].trim().split(" ");
    const predicate = predicateWords.slice(1, predicateWords.length - 1);
    const parsedPredicate = parseExpression(predicate.join(" "));

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
    const elseBody = lines.slice(elseIndex + 1);

    const parsedIfBody = parseExpression(ifBody.join("\n"));
    const parsedElseBody = parseExpression(elseBody.join("\n"));

    const errors = [ ];
    if (parsedPredicate.kind === "err") errors.push(parsedPredicate.error);
    if (parsedIfBody.kind === "err") errors.push(parsedIfBody.error);
    if (parsedElseBody.kind === "err") errors.push(parsedElseBody.error);

    if (errors.length > 0) {
        return Err(errors.join("\n"));
    }

    return Ok(
        IfStatement(
            (parsedPredicate as Ok<Expression>).value,
            (parsedIfBody as Ok<Expression>).value,
            (parsedElseBody as Ok<Expression>).value
        )
    );
}

function parseCaseStatement(body: string): Result<string, CaseStatement> {
    body = body
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .join("\n");

    const rootIndentLevel = getIndentLevel(body.split("\n")[0]);
    const casePredicate = parseExpression(
        body.split("case ")[1].split(" of")[0]
    );
    const lines = body.split("\n");

    let branches = [ ];
    let branchPattern = "";
    let branchLines: string[] = [ ];

    for (var i = 1; i < lines.length; i++) {
        const line = lines[i];
        const indent = getIndentLevel(line);

        let wasReset = false;

        if (rootIndentLevel + 4 === indent) {
            if (branchPattern === "") {
                wasReset = true;
                branchPattern = line.split("->")[0];
                branchLines.push(line.split("->")[1]);
            }

            if (!branchLines.join("").trim()) {
                continue;
            }

            const branchExpression = parseExpression(branchLines.join("\n"));

            const parsedBranchPattern = parseDestructure(branchPattern);

            if (
                branchExpression.kind === "err" ||
                parsedBranchPattern.kind === "err"
            ) {
                if (branchExpression.kind === "err")
                    branches.push(branchExpression);
                if (parsedBranchPattern.kind === "err")
                    branches.push(parsedBranchPattern);
            } else {
                branches.push(
                    Ok(
                        Branch(
                            (parsedBranchPattern as Ok<Destructure>).value,
                            (branchExpression as Ok<Expression>).value
                        )
                    )
                );
            }

            if (!wasReset) {
                branchPattern = line.split("->")[0];
                branchLines = [ line.split("->")[1] ];
            } else {
                branchPattern = "";
                branchLines = [ ];
            }
        } else {
            branchLines.push(line);
        }
    }

    if (branchLines.length > 0) {
        const branchExpression = parseExpression(branchLines.join("\n"));

        const parsedBranchPattern = parseDestructure(branchPattern);

        if (
            branchExpression.kind === "err" ||
            parsedBranchPattern.kind === "err"
        ) {
            if (branchExpression.kind === "err")
                branches.push(branchExpression);
            if (parsedBranchPattern.kind === "err")
                branches.push(parsedBranchPattern);
        } else {
            branches.push(
                Ok(
                    Branch(
                        (parsedBranchPattern as Ok<Destructure>).value,
                        (branchExpression as Ok<Expression>).value
                    )
                )
            );
        }
    }

    const errors = [ ];
    if (casePredicate.kind === "err") errors.push(casePredicate.error);
    branches.forEach((branch) => {
        if (branch.kind === "err") {
            errors.push(branch.error);
        }
    });

    if (errors.length > 0) {
        return Err(errors.join("\n"));
    }

    const validBranches = branches.map((value) => (value as Ok<Branch>).value);

    return Ok(
        CaseStatement((casePredicate as Ok<Expression>).value, validBranches)
    );
}

function parseAddition(body: string): Result<string, Addition> {
    const left = body.split("+")[0];
    const right = body.split("+").slice(1).join("+");

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    if (leftParsed.kind === "err") return leftParsed;
    if (rightParsed.kind === "err") return rightParsed;

    return Ok(Addition(leftParsed.value, rightParsed.value));
}

function parseSubtraction(body: string): Result<string, Subtraction> {
    const left = body.split("-")[0];
    const right = body.split("-").slice(1).join("-");

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    if (leftParsed.kind === "err") return leftParsed;
    if (rightParsed.kind === "err") return rightParsed;

    return Ok(Subtraction(leftParsed.value, rightParsed.value));
}

function parseMultiplcation(body: string): Result<string, Multiplication> {
    const left = body.split("*")[0];
    const right = body.split("*").slice(1).join("*");

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    if (leftParsed.kind === "err") return leftParsed;
    if (rightParsed.kind === "err") return rightParsed;

    return Ok(Multiplication(leftParsed.value, rightParsed.value));
}

function parseDivision(body: string): Result<string, Division> {
    const left = body.split("/")[0];
    const right = body.split("/").slice(1).join("/");

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    if (leftParsed.kind === "err") return leftParsed;
    if (rightParsed.kind === "err") return rightParsed;

    return Ok(Division(leftParsed.value, rightParsed.value));
}

function parseLeftPipe(body: string): Result<string, LeftPipe> {
    const left = body.split("|>")[0];
    const right = body.split("|>").slice(1).join("|>");

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    if (leftParsed.kind === "err") return leftParsed;
    if (rightParsed.kind === "err") return rightParsed;
    if (!isLeftPipeableExpression(rightParsed.value))
        return Err(`Could not pipe to ${rightParsed.value}`);

    return Ok(LeftPipe(leftParsed.value, rightParsed.value));
}

function parseRightPipe(body: string): Result<string, RightPipe> {
    const left = body.split("<|")[0];
    const right = body.split("<|").slice(1).join("<|");

    const leftParsed = parseExpression(left);
    const rightParsed = parseExpression(right);

    if (leftParsed.kind === "err") return leftParsed;
    if (rightParsed.kind === "err") return rightParsed;

    return Ok(RightPipe(leftParsed.value, rightParsed.value));
}

function parseModuleReference(body: string): Result<string, ModuleReference> {
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

    const expression = parseExpression(value);

    if (expression.kind === "err") return expression;

    return Ok(ModuleReference(moduleName, expression.value));
}

function parseFunctionCall(body: string): Result<string, FunctionCall> {
    const trimmedBody = body.trim();
    const functionName = trimmedBody.split(" ")[0];
    const args: (string | Result<string, Expression>)[] = [ ];
    let buffer = "";
    let isInList = false;
    let isInObjectLiteral = false;
    let isInQuote = false;

    const withoutFunctionCall = trimmedBody.split(" ").slice(1).join(" ");

    for (var i = 0; i < withoutFunctionCall.length; i++) {
        const currentChar = withoutFunctionCall[i];

        if (currentChar === "[") {
            isInList = true;
            buffer += currentChar;
        } else if (currentChar === "]") {
            isInList = false;
            buffer += currentChar;
            args.push(buffer);
            buffer = "";
        } else if (currentChar === "{") {
            isInObjectLiteral = true;
            buffer += currentChar;
        } else if (currentChar === "}") {
            isInObjectLiteral = false;
            buffer += currentChar;
        } else if (currentChar === '"') {
            if (isInQuote) {
                args.push(Ok(StringValue(buffer)));
                buffer = "";
                isInQuote = false;
            } else {
                isInQuote = true;
            }
        } else if (
            currentChar === " " &&
            !isInList &&
            !isInObjectLiteral &&
            !isInQuote
        ) {
            args.push(Ok(Value(buffer)));
            buffer = "";
        } else {
            buffer += currentChar;
        }
    }

    if (buffer.length > 0) {
        args.push(buffer);
    }

    const parsedArgs = args.map((arg) => {
        if (typeof arg === "string") {
            return parseExpression(arg);
        }
        return arg;
    });

    const errors = parsedArgs.filter((arg) => arg.kind === "err");

    if (errors.length > 0) {
        return Err(
            "Failed to parse function call due to:\n" +
                errors.map((error) => (error as Err<string>).error).join("\n")
        );
    }

    const correctArgs = parsedArgs
        .filter((arg) => arg.kind === "ok")
        .map((arg) => (arg as Ok<Expression>).value);

    return Ok(FunctionCall(functionName, correctArgs));
}

function parseLambda(body: string): Result<string, Lambda> {
    // Looks like \x y -> x + y
    const trimmedBody = body.trim();

    // Looks like [x, y]
    const args = trimmedBody.split("->")[0].split("\\")[1].trim().split(" ");

    // Looks like x + y
    const lambdaBody = trimmedBody.split("->")[1].trim();
    const parsedBody = parseExpression(lambdaBody);

    if (parsedBody.kind === "err") {
        return Err(
            "Failed to parse lambda definiton due to:\n" + parsedBody.error
        );
    }

    return Ok(Lambda(args, parsedBody.value));
}

function parseEquality(body: string): Result<string, Equality> {
    const left = parseExpression(body.split(" == ")[0]);
    const right = parseExpression(body.split(" == ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(Equality(left.value, right.value));
}

function parseInEquality(body: string): Result<string, InEquality> {
    const left = parseExpression(body.split(" != ")[0]);
    const right = parseExpression(body.split(" != ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(InEquality(left.value, right.value));
}

function parseLessThan(body: string): Result<string, LessThan> {
    const left = parseExpression(body.split(" < ")[0]);
    const right = parseExpression(body.split(" < ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(LessThan(left.value, right.value));
}

function parseLessThanOrEqual(body: string): Result<string, LessThanOrEqual> {
    const left = parseExpression(body.split(" <= ")[0]);
    const right = parseExpression(body.split(" <= ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(LessThanOrEqual(left.value, right.value));
}

function parseGreaterThan(body: string): Result<string, GreaterThan> {
    const left = parseExpression(body.split(" > ")[0]);
    const right = parseExpression(body.split(" > ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(GreaterThan(left.value, right.value));
}

function parseGreaterThanOrEqual(
    body: string
): Result<string, GreaterThanOrEqual> {
    const left = parseExpression(body.split(" >= ")[0]);
    const right = parseExpression(body.split(" >= ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(GreaterThanOrEqual(left.value, right.value));
}

function parseAnd(body: string): Result<string, And> {
    const left = parseExpression(body.split(" && ")[0]);
    const right = parseExpression(body.split(" && ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(And(left.value, right.value));
}

function parseOr(body: string): Result<string, Or> {
    const left = parseExpression(body.split(" || ")[0]);
    const right = parseExpression(body.split(" || ")[1]);

    if (left.kind === "err") return left;
    if (right.kind === "err") return right;

    return Ok(Or(left.value, right.value));
}

export function parseExpression(body: string): Result<string, Expression> {
    const trimmedBody = body.trim();

    if (trimmedBody.startsWith("if ")) {
        return parseIfStatement(body);
    } else if (trimmedBody.startsWith("case ")) {
        return parseCaseStatement(body);
    } else if (trimmedBody.startsWith("{")) {
        return parseObjectLiteral(body);
    } else if (trimmedBody.startsWith("\\")) {
        return parseLambda(body);
    } else if (trimmedBody.indexOf("|>") > -1) {
        return parseLeftPipe(body);
    } else if (trimmedBody.indexOf("<|") > -1) {
        return parseRightPipe(body);
    } else if (trimmedBody.indexOf(" == ") > -1) {
        return parseEquality(body);
    } else if (trimmedBody.indexOf(" != ") > -1) {
        return parseInEquality(body);
    } else if (trimmedBody.indexOf(" < ") > -1) {
        return parseLessThan(body);
    } else if (trimmedBody.indexOf(" <= ") > -1) {
        return parseLessThanOrEqual(body);
    } else if (trimmedBody.indexOf(" > ") > -1) {
        return parseGreaterThan(body);
    } else if (trimmedBody.indexOf(" >= ") > -1) {
        return parseGreaterThanOrEqual(body);
    } else if (trimmedBody.indexOf(" && ") > -1) {
        return parseAnd(body);
    } else if (trimmedBody.indexOf(" || ") > -1) {
        return parseOr(body);
    } else if (trimmedBody.indexOf("+") > -1) {
        return parseAddition(body);
    } else if (trimmedBody.indexOf("-") > -1) {
        return parseSubtraction(body);
    } else if (trimmedBody.indexOf("*") > -1) {
        return parseMultiplcation(body);
    } else if (trimmedBody.indexOf("/") > -1) {
        return parseDivision(body);
    } else if (trimmedBody.startsWith('"')) {
        return parseStringValue(body);
    } else if (trimmedBody.startsWith("`")) {
        return parseFormatStringValue(body);
    } else if (trimmedBody.startsWith("[")) {
        if (trimmedBody.indexOf("..") > -1) {
            return parseListRange(body);
        }
        return parseListValue(body);
    } else if (trimmedBody.split(" ").length === 1) {
        return parseValue(body);
    } else {
        const firstPart = trimmedBody.split(" ")[0];
        const possibleModuleParts = firstPart.split(".");

        if (possibleModuleParts.length > 1) {
            return parseModuleReference(body);
        }

        const firstChar = trimmedBody.slice(0, 1);
        if (firstChar.toUpperCase() === firstChar) {
            return parseConstructor(body);
        }

        if (trimmedBody.split(" ").length > 1) {
            return parseFunctionCall(body);
        }
    }

    return Err(`No expression found: '${body}'`);
}

function parseFunction(block: string): Result<string, Function> {
    const typeLine = block.split("\n")[0];
    const functionName = typeLine.split(":")[0].trim();
    const types = typeLine
        .split(":")
        .slice(1)
        .join(":")
        .split("->")
        .map((s) => s.trim());

    const lines = block.split("\n");

    const letStart = lines.findIndex((line) => line.startsWith("    let"));
    const letEnd = lines.findIndex((line) => line.startsWith("    in"));

    let letBlock: Block[] = [ ];

    if (letStart > -1 && letEnd > -1) {
        const letLines = lines
            .slice(letStart + 1, letEnd)
            .map((line) => line.slice(8));
        const letBlocks = intoBlocks(letLines.join("\n"));

        letBlock = letBlocks
            .map(parseBlock)
            .filter((block) => block.kind === "ok")
            .map((block) => (block as Ok<Block>).value);
    }

    const argumentLine = lines[1];
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
                const parsedType = parseType(type_);
                if (parsedType.kind === "err")
                    return Err(
                        `Failed to parse argument ${i} due to ${parsedType.error}`
                    );

                return Ok(AnonFunctionArg(i, parsedType.value));
            } else {
                const name = argumentNames[i];
                const parsedType = parseType(type_);
                if (parsedType.kind === "err")
                    return Err(
                        `Failed to parse ${name} due to ${parsedType.error}`
                    );

                return Ok(FunctionArg(name, parsedType.value));
            }
        });

    const returnParts = types[types.length - 1].trim().split(" ");
    const returnType = parseType(returnParts.join(" "));

    const body = [ argumentLine.split("=").slice(1).join("=").trim() ].concat(
        block.split("\n").slice(letEnd > -1 ? letEnd + 1 : 2)
    );

    const parsedBody = parseExpression(body.join("\n"));

    if (parsedBody.kind === "err") return parsedBody;
    if (returnType.kind === "err") return returnType;

    for (var i = 0; i < combinedArguments.length; i++) {
        const arg = combinedArguments[i];
        if (arg.kind === "err") return arg;
    }

    return Ok(
        Function(
            functionName,
            returnType.value,
            combinedArguments.map((arg) => (arg as Ok<FunctionArg>).value),
            letBlock,
            parsedBody.value
        )
    );
}

function parseConst(block: string): Result<string, Const> {
    const typeLine = block.split("\n")[0];
    const constName = typeLine.split(":")[0].trim();
    const constType = typeLine.split(":").slice(1).join(":").trim();
    const parsedType = parseType(constType);

    const bodyLines = block.split("\n").slice(1).join("\n");
    const init: { pieces: string[]; hasSeenText: boolean } = {
        pieces: [ ],
        hasSeenText: false,
    };
    const body = bodyLines
        .split("=")
        .slice(1)
        .join("=")
        .split("\n")
        .reduce((obj, line: string) => {
            const { pieces, hasSeenText } = obj;
            if (hasSeenText) {
                pieces.push(line);
                return { pieces, hasSeenText };
            } else if (line.trim().length === 0) {
                return { pieces, hasSeenText };
            } else {
                pieces.push(line);
                return { pieces, hasSeenText: true };
            }
        }, init)
        .pieces.join("\n");

    const parsedBody = parseExpression(body);

    if (parsedBody.kind === "err") return parsedBody;
    if (parsedType.kind === "err") return parsedType;

    return Ok(Const(constName, parsedType.value, parsedBody.value));
}

function parseImport(block: string): Result<string, Import> {
    const moduleNames = block
        .split("\n")
        .map((importLine) => importLine.split("import")[1].trim());

    return Ok(Import(moduleNames));
}

function parseExport(block: string): Result<string, Export> {
    const moduleNames = block
        .split("\n")
        .map((exportLine) =>
            exportLine
                .split("exposing")[1]
                .trim()
                .slice(1, -1)
                .split(",")
                .map((l) => l.trim())
        )
        .reduce((val, cur) => [ ...val, ...cur ]);

    return Ok(Export(moduleNames));
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

    switch (block.kind) {
        case "ImportBlock": {
            return wrapError(parseImport(block.lines.join("\n")));
        }
        case "ExportBlock": {
            return wrapError(parseExport(block.lines.join("\n")));
        }
        case "UnionTypeBlock": {
            return wrapError(parseUnionType(block.lines.join("\n")));
        }
        case "TypeAliasBlock": {
            return wrapError(parseTypeAlias(block.lines.join("\n")));
        }
        case "FunctionBlock": {
            return wrapError(parseFunction(block.lines.join("\n")));
        }
        case "ConstBlock": {
            return wrapError(parseConst(block.lines.join("\n")));
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

export function parse(body: string): Module {
    const blocks = intoBlocks(body);
    const syntax = blocks.map(parseBlock);
    const errors = syntax
        .filter((syn) => syn.kind === "err")
        .map((syn) => (syn as Err<string>).error);
    const successes = syntax
        .filter((syn) => syn.kind === "ok")
        .map((syn) => (syn as Ok<Block>).value);

    const typeErrors = syntax
        .map((resultBlock, index) => {
            if (resultBlock.kind === "err") return null;

            const block = resultBlock as Ok<Block>;
            const validatedType = validateType(block.value);
            const gap = getGap(blocks, index);

            return mapError(
                (error) =>
                    `Error on lines ${gap}\n${error}:
${reportBlock(blocks[index])}`,
                validatedType
            );
        })
        .filter((type) => type && type.kind === "err")
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

    return Module(
        "main",
        syntax
            .filter((syn) => syn.kind === "ok")
            .map((syn) => (syn as Ok<any>).value),
        [ ...errors, ...typeErrors, ...collidingNames ]
    );
}
