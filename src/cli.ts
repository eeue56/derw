import {
    allErrors,
    bothFlag,
    empty,
    help,
    longFlag,
    oneOf,
    parse,
    parser,
    string,
    variableList,
} from "@eeue56/baner";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { spawnSync } from "child_process";
import { promises } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import * as util from "util";
import { compileTypescript } from "./compile";
import { generateDerw } from "./derw_generator";
import { generateTypescript } from "./generator";
import { generateJavascript } from "./js_generator";
import * as derwParser from "./parser";
import { Block, Module } from "./types";

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

function filterBodyForName(module: Module, name: string): Block[] {
    const blocks = [ ];
    for (var element of module.body) {
        switch (element.kind) {
            case "Function":
            case "Const": {
                if (element.name === name) {
                    blocks.push(element);
                }
                break;
            }
            case "Import": {
                for (var moduleName of element.moduleNames) {
                    if (moduleName === name) {
                        blocks.push(element);
                        break;
                    }
                }
                break;
            }
            case "UnionType":
            case "TypeAlias": {
                if (element.type.name === name) {
                    blocks.push(element);
                }
                break;
            }
        }
    }

    return blocks;
}

const programParser = parser([
    longFlag("files", "Filenames to be given", variableList(string())),
    longFlag(
        "target",
        "Target either TS or JS output",
        oneOf([ "ts", "js", "derw" ])
    ),
    longFlag("output", "Output directory name", string()),
    longFlag(
        "verify",
        "Run typescript compiler on generated files to ensure valid output",
        empty()
    ),
    longFlag("debug", "Show a parsed object tree", empty()),
    longFlag("only", "Only show a particular object", string()),
    longFlag("run", "Should be run via ts-node/node", empty()),
    longFlag("format", "Format the files given in-place", empty()),
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
    }

    const debugMode = program.flags["debug"].isPresent;

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

    const isFormat = program.flags.format.isPresent;

    if (!program.flags.output.isPresent && !isFormat) {
        console.log(
            "You must provide a output directory name via --output or format in-place via --format"
        );
        return;
    }

    const outputDir = program.flags.output.isPresent
        ? (program.flags.output.arguments as Ok<string>).value
        : "./";
    const isStdout = outputDir === "/dev/stdout";

    if (!isStdout) {
        await ensureDirectoryExists(outputDir);
    }

    const target = isFormat
        ? "derw"
        : program.flags.target.isPresent
        ? (program.flags.target.arguments as Ok<"ts" | "js" | "derw">).value
        : "ts";

    const shouldRun = program.flags.run.isPresent;

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

            const derwContents = (await promises.readFile(fileName)).toString();

            const parsed = derwParser.parse(derwContents);

            if (parsed.errors.length > 0) {
                console.log(`Failed to parse ${fileName} due to:`);
                console.log(parsed.errors.join("\n"));
                return;
            }

            if (debugMode) {
                if (program.flags["only"].isPresent) {
                    if (program.flags["only"].arguments.kind === "err") {
                        console.log(program.flags.only.arguments.error);
                    } else {
                        const name = (
                            program.flags["only"].arguments as Ok<string>
                        ).value;
                        const blocks = filterBodyForName(parsed, name);
                        console.log(`Filtering for ${name}...`);
                        console.log(util.inspect(blocks, true, null, true));
                    }
                    return;
                }
                console.log(util.inspect(parsed, true, null, true));
                return;
            }

            let generated;

            switch (target) {
                case "js": {
                    generated =
                        generateJavascript(parsed) + emptyLineAtEndOfFile;
                    break;
                }
                case "ts": {
                    generated =
                        generateTypescript(parsed) + emptyLineAtEndOfFile;

                    if (program.flags.verify.isPresent) {
                        const output = compileTypescript(generated);

                        if (output.kind === "err") {
                            console.log(
                                `Failed to compile ${fileName} due to`,
                                output.error.join("\n")
                            );
                        } else {
                            console.log(`Successfully compiled ${fileName}`);
                        }
                    }
                    break;
                }
                case "derw": {
                    generated = generateDerw(parsed) + emptyLineAtEndOfFile;
                }
            }

            if (isStdout) {
                console.log(generated);
                return;
            }

            if (fileName.indexOf("/") > -1) {
                const dirName = fileName.split("/").slice(0, -1).join("/");
                await ensureDirectoryExists(path.join(outputDir, dirName));
            }

            const outputName = dotParts.slice(0, -1).join(".") + "." + target;
            const fullName = path.join(outputDir, outputName);
            await writeFile(fullName, generated);

            if (shouldRun) {
                let child;
                switch (target) {
                    case "js": {
                        child = spawnSync(`npx`, [ `node`, `${fullName}` ], {
                            stdio: "inherit",
                            encoding: "utf-8",
                        });
                        break;
                    }
                    case "ts": {
                        child = spawnSync(`npx`, [ `ts-node`, `${fullName}` ], {
                            stdio: "inherit",
                            encoding: "utf-8",
                        });
                        break;
                    }
                }
            }
        })
    );
}

main();
