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
import { readdir, writeFile } from "fs/promises";
import path from "path";
import * as util from "util";
import { compileTypescript } from "../compile";
import { addMissingNamesSuggestions } from "../errors/names";
import { generate, Target } from "../generator";
import { loadPackageFile } from "../package";
import * as derwParser from "../parser";
import { Block, ContextModule, contextModuleToModule, Import } from "../types";
import { ensureDirectoryExists, fileExists } from "./utils";

const compileParser = parser([
    longFlag("files", "File names to be compiled", variableList(string())),
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
    longFlag("names", "Check for missing names out of scope", empty()),
    longFlag("quiet", "Keep it short and sweet", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showCompileHelp(): void {
    console.log("Let's write some Derw code");
    console.log("To get started:");
    console.log("Initialize the current directory via `init`");
    console.log("Or provide entry files via `--files`");
    console.log("Or run me without args inside a package directory");
    console.log(help(compileParser));
}

function getImports(module: ContextModule): Block[] {
    return module.body.filter((block) => block.kind === "Import");
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

async function getDerwFiles(dir: string): Promise<string[]> {
    let files: string[] = [ ];

    for (const file of await readdir(dir, { withFileTypes: true })) {
        if (file.isFile()) {
            if (file.name.endsWith("derw")) {
                files.push(path.join(dir, file.name));
            }
        } else if (file.isDirectory()) {
            if (file.name === "node_modules") {
            } else {
                files = files.concat(
                    await getDerwFiles(path.join(dir, file.name))
                );
            }
        }
    }

    return files;
}

function filterBodyForName(module: ContextModule, name: string): Block[] {
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

export type ProcessedFiles = Record<string, ContextModule>;

export async function compileFiles(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<ProcessedFiles> {
    const program = parse(compileParser, argv);

    if (program.flags["h/help"].isPresent) {
        showCompileHelp();
        return {};
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }

    if (!program.flags.files.isPresent && !isInPackageDirectory) {
        console.log("You must provide at least one file via --files");
        console.log("Or be in a directory wit derw-package.json.");
        process.exit(1);
    }

    const debugMode = program.flags["debug"].isPresent;

    const isPackageDirectoryAndNoFilesPassed =
        isInPackageDirectory && !program.flags.files.isPresent;

    const files = isPackageDirectoryAndNoFilesPassed
        ? await getDerwFiles("./src")
        : (program.flags.files.arguments as Ok<string[]>).value;

    if (isPackageDirectoryAndNoFilesPassed) {
        const packageFile = await loadPackageFile("derw-package.json");

        if (packageFile.kind === "err") {
            console.log("Failed to parse package file due to:");
            console.log(packageFile.error);
            process.exit(1);
        }

        const validPackage = packageFile.value;
        for (const dep of validPackage.dependencies) {
            for (const file of await getDerwFiles(
                `derw-packages/${dep.name}/src`
            )) {
                files.push(file);
            }
        }
    }

    const isFormat = program.flags.format.isPresent;

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
        if (isInPackageDirectory) {
            console.log("Compiling package...");
        }
        console.log(`Generating ${files.length} files...`);
    }

    const processedFiles: string[] = [ ];
    const parsedFiles: Record<string, ContextModule> = {};
    const parsedImports: Record<string, string[]> = {};

    for (const fileName of files) {
        await (async function compile(fileName: string): Promise<void> {
            if (processedFiles.indexOf(fileName) > -1) {
                return;
            }
            const isPackageFile = fileName.startsWith("derw-packages");
            processedFiles.push(fileName);
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
            let parsed = derwParser.parseWithContext(
                derwContents,
                isMain ? "Main" : fileName
            );

            if (program.flags.names.isPresent) {
                parsed = addMissingNamesSuggestions(parsed);
            }

            if (parsed.errors.length > 0) {
                console.log(`Failed to parse ${fileName} due to:`);
                console.log(parsed.errors.join("\n"));
                return;
            }

            parsedFiles[fileName] = parsed;

            const dir = path.dirname(fileName);
            const imports: string[] = [ ];

            getImports(parsed).forEach((import_: Block) => {
                import_ = import_ as Import;

                import_.modules.forEach((module) => {
                    if (isPackageFile) {
                        if (module.name.startsWith('"../derw-packages')) {
                            module.name = module.name.replace(
                                "../derw-packages",
                                "../../.."
                            );
                        }
                    }
                    if (module.namespace === "Global") return;
                    const moduleName = module.name.slice(1, -1);
                    imports.push(path.normalize(path.join(dir, moduleName)));
                });
            });

            parsedImports[fileName] = [ ];

            for (const import_ of imports) {
                const fileWithDerwExtension = import_ + `.derw`;
                const isDerw = await fileExists(fileWithDerwExtension);

                if (isDerw) {
                    parsedImports[fileName].push(fileWithDerwExtension);

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

            const importedContextModules = [ ];
            for (const import_ of parsedImports[fileName]) {
                importedContextModules.push(parsedFiles[import_]);
            }
            parsed = derwParser.addTypeErrors(parsed, importedContextModules);
            if (parsed.errors.length > 0) {
                console.log(`Failed to parse ${fileName} due to:`);
                console.log(parsed.errors.join("\n"));
                return;
            }

            const generated = generate(target, contextModuleToModule(parsed));

            if (program.flags.verify.isPresent && target === "ts") {
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
        })(fileName);
    }

    if (!isQuiet) {
        console.log("Processed:", processedFiles);
    }

    return parsedFiles;
}
