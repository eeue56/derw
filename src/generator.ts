import { UnionType, Syntax, Module, Function } from "./types";

export function generateUnionType(syntax: UnionType): string {
    const tagCreators = syntax.tags
        .map((tag) => {
            const typeDefArgs = tag.args
                .map((arg) => arg.name + ": " + arg.type.name + ";")
                .join("\n    ");

            const funcDefArgs = tag.args
                .map((arg) => arg.name)
                .join(",\n         ");

            return `
type ${tag.name} = {
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

type ${syntax.type.name} = ${tags};
`.trim();
}

export function generateFunction(syntax: Function): string {
    return "";
}

export function generateBlock(syntax: Syntax): string {
    switch (syntax.kind) {
        case "UnionType":
            return generateUnionType(syntax);
        case "Function":
            return generateFunction(syntax);
    }
}

export function generateTypescript(module: Module): string {
    return module.body.map(generateBlock).join("\n\n");
}
