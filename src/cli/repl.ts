import { stdin as input, stdout as output } from "process";
import * as readline from "readline";
import { addTypeErrors, parseWithContext } from "../parser";

export async function repl(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const rl = readline.createInterface({ input, output });

    rl.prompt();

    let currentBuffer: string[] = [ ];
    rl.on("close", () => {});

    for await (const line of rl) {
        currentBuffer.push(line.split("\t").join("    "));

        if (line.trim() === "") {
            let module = parseWithContext(currentBuffer.join("\n"), "Main");
            module = addTypeErrors(module, [ ]);

            if (module.errors.length > 0) {
                console.log(
                    `Errors while parsing: ${module.errors.join("\n")}`
                );
            } else {
                console.log("Parsed successfully");
            }
        }
        rl.prompt();
    }
}
