import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks } from "./blocks";
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
} from "./types";

export function blockKind(block: string): Result<string, BlockKinds> {
    if (block.startsWith("type")) {
        return Ok("UnionType");
    }

    if (
        block.split(":").length > 1 &&
        block.split(":")[0].trim().split(" ").length === 1
    ) {
        return Ok("Function");
    }

    return Err("Unknown block type");
}

function parseUnionType(block: string): Result<string, UnionType> {
    // always after "type", one joined token
    const name = block.split(" ")[1].trim();

    // anything after the =, split based on pipes
    const tagParts = block.split("=").slice(1).join("=").split("|");

    const tags = tagParts.map((tag) => {
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
                    .map((name) => Type(name, [ ]));

                return TagArg(split[0].trim(), Type(typeName, typeArguments));
            });

        return Tag(tagName, args);
    });

    return Ok(UnionType(Type(name, [ ]), tags));
}

function parseValue(body: string): Result<string, Value> {
    const trimmed = body.trim();

    if (trimmed.split(" ").length > 1) {
        return Err(`Too many values: ${trimmed}`);
    } else {
        return Ok(Value(trimmed));
    }
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

function parseExpression(body: string): Result<string, Expression> {
    if (body.trim().startsWith("if ")) {
        return parseIfStatement(body);
    } else if (body.trim().split(" ").length === 1) {
        return parseValue(body);
    }
    return Err("No expression found.");
}

function parseFunction(block: string): Result<string, Function> {
    const typeLine = block.split("\n")[0];
    const functionName = typeLine.split(":")[0];
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

    const combinedArguments = types
        .slice(0, types.length - 1)
        .map((type_, i) => {
            return FunctionArg(argumentNames[i], Type(type_, [ ]));
        });

    const returnParts = types[types.length - 1].trim().split(" ");
    const returnType = Type(
        returnParts[0],
        returnParts.slice(1).map((name) => Type(name, [ ]))
    );

    const body = [ argumentLine.split("=").slice(1).join("=").trim() ].concat(
        block.split("\n").slice(2)
    );
    const parsedBody = parseExpression(body.join("\n"));

    if (parsedBody.kind === "err") return parsedBody;

    return Ok(
        Function(functionName, returnType, combinedArguments, parsedBody.value)
    );
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
