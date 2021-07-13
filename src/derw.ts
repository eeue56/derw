import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";

export type TagArg = {
    kind: "TagArg";
    name: string;
    type: string;
};

export function TagArg(name: string, type: string): TagArg {
    return {
        kind: "TagArg",
        name,
        type,
    };
}

export type Tag = {
    kind: "Tag";
    name: string;
    args: TagArg[];
};

export function Tag(name: string, args: TagArg[]): Tag {
    return {
        kind: "Tag",
        name,
        args,
    };
}

export type UnionType = {
    kind: "UnionType";
    name: string;
    tags: Tag[];
};

export function UnionType(name: string, tags: Tag[]): UnionType {
    return {
        kind: "UnionType",
        name,
        tags,
    };
}

export type SyntaxKinds = "UnionType";
export type Syntax = UnionType;

export type Module = {
    kind: "Module";
    name: string;
    body: Syntax[];
    errors: string[];
};

export function Module(name: string, body: Syntax[], errors: string[]): Module {
    return {
        kind: "Module",
        name,
        body,
        errors,
    };
}

export function intoBlocks(body: string): string[] {
    const blocks = [ ];

    let currentBlock = [ ];
    const lines = body.split("\n");
    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === "\n" && currentBlock[currentBlock.length - 1] === "\n") {
            blocks.push(currentBlock.join("\n"));
        } else {
            currentBlock.push(line);
        }
    }

    if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
    }

    return blocks;
}

export function blockKind(block: string): Result<string, SyntaxKinds> {
    if (block.startsWith("type")) {
        return Ok("UnionType");
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
                return TagArg(split[0].trim(), split[1].trim());
            });

        return Tag(tagName, args);
    });

    return Ok(UnionType(name, tags));
}

function parseBlock(block: string): Result<string, Syntax> {
    const kind = blockKind(block);

    if (kind.kind === "err") return kind;

    switch (kind.value) {
        case "UnionType": {
            return parseUnionType(block);
        }
    }

    return Err("");
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

export function generateUnionType(syntax: UnionType): string {
    const tagCreators = syntax.tags
        .map((tag) => {
            const typeDefArgs = tag.args
                .map((arg) => arg.name + ": " + arg.type + ";")
                .join("\n    ");

            const funcDefArgs = tag.args
                .map((arg) => arg.name)
                .join(",\n         ");

            return `
type ${tag.name} {
    kind: "${tag.name}";${
                typeDefArgs.length === 0 ? "" : "\n    " + typeDefArgs
            }
}

function ${tag.name}(${tag.args.map((arg) => arg.name).join(",")}): ${
                tag.name
            } {
    return {
        kind: "${tag.name}",${
                funcDefArgs.length === 0 ? "" : "\n        " + funcDefArgs
            }
    }
}`;
        })
        .join("\n");

    const tags = syntax.tags
        .map((tag) => {
            return `${tag.name}`;
        })
        .join(" | ");

    return `
${tagCreators}

type ${syntax.name} = ${tags}
`.trim();
}

export function generateBlock(syntax: Syntax): string {
    switch (syntax.kind) {
        case "UnionType":
            return generateUnionType(syntax);
    }
}

export function generateTypescript(module: Module): string {
    return module.body.map(generateBlock).join("\n");
}
