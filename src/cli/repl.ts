import { writeFile } from "fs/promises";
import { stdin as input, stdout as output } from "process";
import * as readline from "readline";
import { generateTypescript } from "../generators/ts";
import { addTypeErrors, parseWithContext } from "../parser";
import { IdentifierToken, tokenize } from "../tokens";
import { ContextModule, contextModuleToModule, Export } from "../types";
import { ensureDirectoryExists } from "./utils";

function exportEverything(module: ContextModule): ContextModule {
    const exposing = [ ];
    for (const block of module.body) {
        switch (block.kind) {
            case "Const":
            case "Function": {
                exposing.push(block.name);
                break;
            }
            case "TypeAlias":
            case "UnionType": {
                exposing.push(block.type.name);
                break;
            }
        }
    }
    module.body.push(Export(exposing));
    return module;
}

export async function repl(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    let currentBuffer: string[] = [ ];

    function completer(text: string): readline.CompleterResult {
        const tokens = tokenize(currentBuffer.join("\n"));
        const identifiers = tokens.filter(
            (token) => token.kind === "IdentifierToken"
        );

        return [
            [
                ...new Set(
                    identifiers.map((token) => (token as IdentifierToken).body)
                ),
            ],
            text,
        ];
    }

    const rl = readline.createInterface({
        input,
        output,
        completer,
        tabSize: 4,
    });

    rl.prompt();

    rl.on("close", () => {});

    let currentlyImportedModule = null;
    let module = null;
    await ensureDirectoryExists("derw-packages/.cli/");

    async function run(currentBuffer: string[]): Promise<void> {
        module = parseWithContext([ ...currentBuffer ].join("\n"), "Main");
        module = exportEverything(module);

        const generated = generateTypescript(contextModuleToModule(module));

        const fileTimestamp = new Date().getTime();
        const filename = `${process.cwd()}/derw-packages/.cli/${fileTimestamp}.ts`;
        await writeFile(filename, generated);
        currentlyImportedModule = await import(filename);
    }

    let linesAddedToCurrentBufferSinceLastParsing: string[] = [ ];

    for await (const line of rl) {
        if (line.trim() === "") {
            module = parseWithContext(
                [
                    ...currentBuffer,
                    "",
                    ...linesAddedToCurrentBufferSinceLastParsing,
                ].join("\n"),
                "Main"
            );
            module = addTypeErrors(module, [ ]);

            if (module.errors.length > 0) {
                console.log(
                    `Errors while parsing: ${module.errors.join("\n")}`
                );
                linesAddedToCurrentBufferSinceLastParsing = [ ];
            } else {
                for (const newLine of linesAddedToCurrentBufferSinceLastParsing) {
                    currentBuffer.push(newLine);
                }
                linesAddedToCurrentBufferSinceLastParsing = [ ];
                currentBuffer.push("");
                console.log("Parsed successfully");
            }
        } else if (line.trim() === ":run") {
            await run(currentBuffer);
        } else if (line.startsWith(":show")) {
            const name = line.split(" ")[1].trim();
            await run(currentBuffer);
            1;
            if (currentlyImportedModule[name] === undefined) {
                console.log(`Couldn't find ${name} in current scope.`);
            } else {
                console.log(currentlyImportedModule[name]);
            }
        } else if (line.trim() === ":help") {
            console.log("Enter some code, followed by a blank newline.");
            console.log("Run the current namespace via :run");
            console.log("And check the values of code via :show <name>");
            console.log(
                "Or evaluate a constant or function with :eval <function> <args>"
            );
        } else if (line.startsWith(":eval")) {
            const expression = `
_cli: any
_cli = ${line.split(" ").slice(1).join(" ")}
`;

            module = parseWithContext(
                [ ...currentBuffer, "", expression ].join("\n"),
                "Main"
            );
            module = exportEverything(module);

            if (module.errors.length > 0) {
                console.log(
                    `Errors while parsing: ${module.errors.join("\n")}`
                );
                continue;
            } else {
                console.log("Parsed successfully");
            }

            const generated = generateTypescript(contextModuleToModule(module));

            const fileTimestamp = new Date().getTime();
            const filename = `${process.cwd()}/derw-packages/.cli/${fileTimestamp}.ts`;
            await writeFile(filename, generated);
            currentlyImportedModule = await import(filename);
            console.log(currentlyImportedModule["_cli"]);
        } else {
            linesAddedToCurrentBufferSinceLastParsing.push(
                line.split("\t").join("    ")
            );
        }
        rl.prompt();
    }
}
