import { writeFile } from "fs/promises";
import { stdin as input, stdout as output } from "process";
import * as readline from "readline";
import { addTypeErrors, parseWithContext } from "../parser";
import { generateTypescript } from "../ts_generator";
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
    const rl = readline.createInterface({ input, output });

    rl.prompt();

    let currentBuffer: string[] = [ ];
    rl.on("close", () => {});

    let currentModule = null;

    for await (const line of rl) {
        if (line.trim() === "") {
            currentBuffer.push("");
            let module = parseWithContext(currentBuffer.join("\n"), "Main");
            module = addTypeErrors(module, [ ]);

            if (module.errors.length > 0) {
                console.log(
                    `Errors while parsing: ${module.errors.join("\n")}`
                );
            } else {
                console.log("Parsed successfully");
            }
        } else if (line.trim() === ":run") {
            await ensureDirectoryExists("derw-packages/.cli/");

            let module = parseWithContext(
                [ ...currentBuffer ].join("\n"),
                "Main"
            );
            module = exportEverything(module);

            const generated = generateTypescript(contextModuleToModule(module));

            const fileTimestamp = new Date().getTime();
            const filename = `${process.cwd()}/derw-packages/.cli/${fileTimestamp}.ts`;
            await writeFile(filename, generated);
            currentModule = await import(filename);
        } else if (line.startsWith(":show")) {
            const name = line.split(" ")[1].trim();
            console.log(currentModule[name]);
        } else if (line.trim() === ":help") {
            console.log("Enter some code, followed by a blank newline.");
            console.log("Run the current namespace via :run");
            console.log(
                "And check the values of code via :show <name> after using :run"
            );
        } else {
            currentBuffer.push(line.split("\t").join("    "));
        }
        rl.prompt();
    }
}
