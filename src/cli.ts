#!/usr/bin/env ts-node
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
import { generateElm } from "./elm_generator";
import { generateJavascript } from "./js_generator";
import * as derwParser from "./parser";
import { generateTypescript } from "./ts_generator";
import { Block, Import, Module } from "./types";

const emptyLineAtEndOfFile = "\n";

type Target = "js" | "ts" | "derw" | "elm";

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
                for (var module_ of element.modules) {
                    if (module_.name === name) {
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

function getImports(module: Module): Block[] {
    return module.body.filter((block) => block.kind === "Import");
}

async function fileExists(name: string): Promise<boolean> {
    try {
        await promises.access(name);
    } catch (e) {
        return false;
    }
    return true;
}

function runFile(target: Target, fullName: string): void {
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

function generate(
    target: Target,
    shouldVerify: boolean,
    parsed: Module,
    fileName: string
): string {
    switch (target) {
        case "js": {
            return generateJavascript(parsed) + emptyLineAtEndOfFile;
        }
        case "ts": {
            const generated = generateTypescript(parsed) + emptyLineAtEndOfFile;

            if (shouldVerify) {
                const output = compileTypescript(generated);

                if (output.kind === "err") {
                    console.log(
                        `Failed to compile ${fileName} due to`,
                        output.error.map((e) => e.messageText).join("\n")
                    );
                } else {
                    console.log(`Successfully compiled ${fileName}`);
                }
            }

            return generated;
        }
        case "derw": {
            return generateDerw(parsed) + emptyLineAtEndOfFile;
        }
        case "elm": {
            return generateElm(parsed) + emptyLineAtEndOfFile;
        }
    }
}

const programParser = parser([
    longFlag("files", "Filenames to be given", variableList(string())),
    longFlag(
        "target",
        "Target TS, JS or Derw output",
        oneOf([ "ts", "js", "derw", "elm" ])
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
    longFlag("quiet", "Keep it short and sweet", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showHelp(): void {
    console.log("Compiles Derw code");
    console.log("Provide entry files via --files");
    console.log(help(programParser));
}

export async function main(): Promise<void> {
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
        process.exit(1);
    }

    if (!program.flags.files.isPresent) {
        console.log("You must provide at least one file via --files");
        process.exit(1);
    }

    const files = (program.flags.files.arguments as Ok<string[]>).value;

    const isFormat = program.flags.format.isPresent;

    if (!program.flags.output.isPresent && !isFormat) {
        console.log(
            "You must provide a output directory name via --output or format in-place via --format"
        );
        process.exit(1);
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
        ? (program.flags.target.arguments as Ok<Target>).value
        : "ts";

    const shouldRun = program.flags.run.isPresent;

    const isQuiet = program.flags.quiet.isPresent;

    if (!isQuiet) {
        console.log(`Generating ${files.length} files...`);
    }

    const processedFiles: string[] = [ ];

    await Promise.all(
        files.map(async function compile(fileName) {
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

            const isMain = files.indexOf(fileName) > -1;
            const parsed = derwParser.parse(
                derwContents,
                isMain ? "Main" : fileName
            );

            if (parsed.errors.length > 0) {
                console.log(`Failed to parse ${fileName} due to:`);
                console.log(parsed.errors.join("\n"));
                return;
            }

            processedFiles.push(fileName);
            const dir = path.dirname(fileName);
            const imports: string[] = [ ];

            getImports(parsed).forEach((import_: Block) => {
                import_ = import_ as Import;

                import_.modules.forEach((module) => {
                    if (module.namespace === "Global") return;
                    const moduleName = module.name.slice(1, -1);
                    imports.push(path.normalize(path.join(dir, moduleName)));
                });
            });

            for (const import_ of imports) {
                const fileWithDerwExtension = import_ + `.derw`;
                const isDerw = await fileExists(fileWithDerwExtension);

                if (isDerw) {
                    await compile(fileWithDerwExtension);
                    continue;
                }

                // check if ts/js versions of the file exist
                const fileWithTsExtension = import_ + `.ts`;
                const fileWithJsExtension = import_ + `.js`;
                let doesFileExist = false;

                if (await fileExists(fileWithTsExtension)) {
                    doesFileExist = true;
                } else if (await fileExists(fileWithJsExtension)) {
                    doesFileExist = true;
                }

                if (!doesFileExist) {
                    console.log(
                        `Warning! Failed to find \`${import_}\` as either derw, ts or js`
                    );
                }
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

            const generated = generate(
                target,
                program.flags.verify.isPresent,
                parsed,
                fileName
            );

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
                runFile(target, fullName);
            }
        })
    );

    if (!isQuiet) {
        console.log("Processed:", processedFiles);
    }
}

if (require.main === module) {
    main();
}
