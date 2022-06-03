import { bothFlag, empty, help, longFlag, parse, parser } from "@eeue56/baner";
import * as chokidar from "chokidar";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { generate } from "../generator";
import { parseWithContext } from "../parser";
import { contextModuleToModule } from "../types";
import { getDerwFiles } from "./utils";

const formatParser = parser([
    longFlag("watch", "Watch Derw files for changes", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showFormatHelp(): void {
    console.log("To format, run `derw format`");
    console.log("To watch use the --watch flag");
    console.log("To produce the smallest bundle use the --optimize flag");
    console.log(help(formatParser));
}

async function formatFile(file: string): Promise<void> {
    const derwContents = (await readFile(file)).toString();

    let parsed = parseWithContext(derwContents, "Main");

    if (parsed.errors.length > 0) {
        console.log(`Failed to parse ${file}`);
        return;
    }

    const outputDerw = generate("derw", contextModuleToModule(parsed));

    // only write if files are formatted differently
    if (derwContents === outputDerw) return;

    await writeFile(file, outputDerw);
}

export async function format(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    if (!isInPackageDirectory) {
        console.log("derw format must be run from inside a package directory");
        process.exit(-1);
    }

    const program = parse(formatParser, argv);
    if (program.flags["h/help"].isPresent) {
        showFormatHelp();
        return;
    }

    if (program.flags.watch.isPresent) {
        console.log("Watching src...");

        const files = await getDerwFiles("./src");

        for (const file of files) {
            await formatFile(file);
        }

        let timer: any;
        chokidar
            .watch(path.join(process.cwd(), "src"))
            .on(
                "all",
                async (
                    event: "add" | "addDir" | "change" | "unlink" | "unlinkDir",
                    path: string
                ): Promise<any> => {
                    if (event === "add" || event === "change") {
                        if (path.endsWith(".derw")) {
                            if (timer !== null) {
                                clearTimeout(timer);
                            }
                            timer = setTimeout(async () => {
                                await formatFile(path);
                            }, 50);
                        }
                    } else if (event === "addDir") {
                        const files = await getDerwFiles(path);
                        for (const file of files) {
                            await formatFile(file);
                        }
                    }
                }
            );
    } else {
        const files = await getDerwFiles("./src");

        for (const file of files) {
            await formatFile(file);
        }
    }
}
