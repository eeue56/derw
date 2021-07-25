import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { type } from "os";
import { intoBlocks } from "./blocks";
import { isBuiltinType } from "./builtins";
import {
    BlockKinds,
    UnionType,
    TagArg,
    Tag,
    Block,
    Module,
    Function,
    Type,
    Value,
    Expression,
    IfStatement,
    FunctionArg,
    FixedType,
    GenericType,
    CaseStatement,
    Branch,
    Destructure,
    Constructor,
    StringValue,
    Const,
    FormatStringValue,
    Addition,
} from "./types";

export function blockKind(block: string): Result<string, BlockKinds> {
    if (block.startsWith("type")) {
        return Ok("UnionType");
    }

    const hasTypeLine = block.split(":").length > 1;
    const isAFunction = block.split("->").length > 1;

    if (hasTypeLine) {
        if (isAFunction) {
            return Ok("Function");
        } else {
            return Ok("Const");
        }
    }

    return Err("Unknown block type");
}

function parseType(line: string): Result<string, Type> {
    const rootTypeName = line.split(" ")[0];
    const typeArguments = line.split(" ").slice(1);

    if (isBuiltinType(rootTypeName)) {
        return Ok(FixedType(rootTypeName, [ ]));
    } else if (rootTypeName.toLowerCase() === rootTypeName) {
        return Ok(GenericType(rootTypeName));
    }
    return Ok(
        FixedType(
            rootTypeName,
            typeArguments
                .map((name) => parseType(name))
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
    const parsedPredicate = parseExpression(predicate.join("\n"));

    const indentLevel = getIndentLevel(lines[0]);

    const elseIndex = lines.reduce(
        (previous, current, index) => {
            if (previous.found) return previous;

            if (current === " ".repeat(indentLevel) + "else") {
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

        if (rootIndentLevel + 4 === indent) {
            if (branchPattern === "") {
                branchPattern = line.split("->")[0];
                branchLines.push(line.split("->")[1]);
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

            branchPattern = "";
            branchLines = [ ];
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

function parseExpression(body: string): Result<string, Expression> {
    const trimmedBody = body.trim();

    if (trimmedBody.startsWith("if ")) {
        return parseIfStatement(body);
    } else if (trimmedBody.startsWith("case ")) {
        return parseCaseStatement(body);
    } else if (trimmedBody.indexOf("+") > -1) {
        return parseAddition(body);
    } else if (trimmedBody.startsWith('"')) {
        return parseStringValue(body);
    } else if (trimmedBody.startsWith("`")) {
        return parseFormatStringValue(body);
    } else if (trimmedBody.split(" ").length === 1) {
        return parseValue(body);
    } else {
        const firstChar = trimmedBody.slice(0, 1);
        if (firstChar.toUpperCase() === firstChar) {
            return parseConstructor(body);
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

    const argumentLine = block.split("\n")[1];
    const argumentNames = argumentLine
        .slice(functionName.length)
        .split("=")[0]
        .split(" ")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const combinedArguments: Result<string, FunctionArg>[] = types
        .slice(0, types.length - 1)
        .map((type_, i) => {
            const name = argumentNames[i];
            const parsedType = parseType(type_);
            if (parsedType.kind === "err")
                return Err(
                    `Failed to parse ${name} due to ${parsedType.error}`
                );

            return Ok(FunctionArg(argumentNames[i], parsedType.value));
        });

    const returnParts = types[types.length - 1].trim().split(" ");
    const returnType = parseType(returnParts.join(" "));

    const body = [ argumentLine.split("=").slice(1).join("=").trim() ].concat(
        block.split("\n").slice(2)
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
    const body = bodyLines.split("=").slice(1).join("=").trim();

    const parsedBody = parseExpression(body);

    if (parsedBody.kind === "err") return parsedBody;
    if (parsedType.kind === "err") return parsedType;

    return Ok(Const(constName, parsedType.value, parsedBody.value));
}

function parseBlock(block: string): Result<string, Block> {
    const kind = blockKind(block);

    if (kind.kind === "err") return kind;

    switch (kind.value) {
        case "UnionType": {
            return parseUnionType(block);
        }
        case "Function": {
            return parseFunction(block);
        }
        case "Const": {
            return parseConst(block);
        }
    }
}

export function parse(body: string): Module {
    const blocks = intoBlocks(body);
    const syntax = blocks.map(parseBlock);
    const errors = syntax
        .filter((syn) => syn.kind === "err")
        .map((syn) => (syn as Err<string>).error);

    return Module(
        "main",
        syntax
            .filter((syn) => syn.kind === "ok")
            .map((syn) => (syn as Ok<any>).value),
        errors
    );
}
