import {
    empty,
    longFlag,
    bothFlag,
    number,
    parse,
    parser,
    string,
    help,
    variableList,
    boolean,
    oneOf,
    allErrors,
} from "@eeue56/baner";
import * as derwParser from "./parser";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { promises } from "fs";
import { generateTypescript } from "./generator";
import { generateJavascript } from "./js_generator";
import { writeFile } from "fs/promises";
import path from "path";

async function ensureDirectoryExists(directory: string): Promise<void> {
    try {
        const lstat = await promises.lstat(directory);
        if (!lstat.isDirectory()) {
            await promises.mkdir(directory, { recursive: true });
        }
    } catch (error) {
        await promises.mkdir(directory, { recursive: true });
    }
}

const programParser = parser([
    longFlag("files", "Filenames to be given", variableList(string())),
    longFlag("target", "Target either TS or JS output", oneOf([ "ts", "js" ])),
    longFlag("output", "Output directory name", string()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showHelp(): void {
    console.log("Compiles Derw code");
    console.log("Provide entry files via --files");
    console.log(help(programParser));
}

async function main(): Promise<void> {
    const program = parse(programParser, process.argv);

    if (program.flags["h/help"].isPresent) {
        showHelp();
        return;
    } else {
        const errors = allErrors(program);
        if (errors.length > 0) {
            console.log("Errors:");
            console.log(errors.join("\n"));
            return;
        }

        if (!program.flags.files.isPresent) {
            console.log("You must provide at least one file via --file");
            return;
        }

        const files = (program.flags.files.arguments as Ok<string[]>).value;

        if (!program.flags.output.isPresent) {
            console.log(
                "You must provide a output directory name via --output"
            );
            return;
        }

        const outputDir = (program.flags.output.arguments as Ok<string>).value;
        await ensureDirectoryExists(outputDir);

        const target = program.flags.target.isPresent
            ? (program.flags.target.arguments as Ok<"ts" | "js">).value
            : "ts";

        const emptyLineAtEndOfFile = "\n";

        console.log(`Generating ${files.length} files...`);

        await Promise.all(
            files.map(async (fileName) => {
                const dotParts = fileName.split(".");
                const extension = dotParts[dotParts.length - 1];

                if (extension !== "derw") {
                    console.log("Warning: Derw files should be called .derw");
                    console.log(
                        `Try renaming ${fileName} to ${dotParts
                            .slice(0, -1)
                            .join(".")}.derw`
                    );
                }

                const derwContents = (
                    await promises.readFile(fileName)
                ).toString();

                const parsed = derwParser.parse(derwContents);

                if (parsed.errors.length > 0) {
                    console.log(`Failed to parse ${fileName} due to:`);
                    console.log(parsed.errors.join("\n"));
                    return;
                }

                let generated;

                switch (target) {
                    case "js": {
                        generated =
                            generateJavascript(parsed) + emptyLineAtEndOfFile;
                    }
                    case "ts": {
                        generated =
                            generateTypescript(parsed) + emptyLineAtEndOfFile;
                    }
                }

                if (fileName.indexOf("/") > -1) {
                    const dirName = fileName.split("/").slice(0, -1).join("/");
                    await ensureDirectoryExists(path.join(outputDir, dirName));
                }

                await writeFile(path.join(outputDir, fileName), generated);
            })
        );
    }
}

main();
