import { runner } from "@eeue56/bach/build/bach";
import {
    allErrors,
    bothFlag,
    empty,
    help,
    longFlag,
    parse,
    parser,
    string,
} from "@eeue56/baner";
import * as chokidar from "chokidar";
import path from "path";
import { compileFiles } from "./compile";

const testingParser = parser([
    longFlag("watch", "Watch Derw files for changes", empty()),
    longFlag("function", "A particular function name to run", string()),
    longFlag("file", "A particular file name to run", string()),
    longFlag("only-fails", "Only log failing tests", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showTestingHelp(): void {
    console.log("To run tests, run `derw test` from the package directory");
    console.log("To watch use the --watch flag");
    console.log(help(testingParser));
}

export async function runTests(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const program = parse(testingParser, argv);
    if (program.flags["h/help"].isPresent) {
        showTestingHelp();
        return;
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }

    if (!isInPackageDirectory) {
        console.log("Must run tests from the root of a package directory.");
        process.exit(1);
    }

    if (program.flags.watch.isPresent) {
        console.log("Watching src and derw-packages...");
        argv.push("--clean-exit");
        let timer: NodeJS.Timeout;
        chokidar
            .watch([
                path.join(process.cwd(), "src"),
                path.join(process.cwd(), "derw-packages"),
            ])
            .on("error", () => {
                console.log("Got an error");
            })
            .on("all", async (event: Event, path: string): Promise<void> => {
                if (path.endsWith(".derw")) {
                    if (timer !== null) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(async () => {
                        await compileFiles(isInPackageDirectory, argv);
                        await runner();
                    }, 300);
                }
            });
    } else {
        await compileFiles(isInPackageDirectory, argv);
        await runner();
    }
}
