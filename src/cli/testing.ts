import { runner } from "@eeue56/bach/build/bach";
import { bothFlag, empty, help, longFlag, parse, parser } from "@eeue56/baner";
import * as chokidar from "chokidar";
import path from "path";
import { compileFiles } from "./compile";

const testingParser = parser([
    longFlag("watch", "Watch Derw files for changes", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showTestingHelp(): void {
    console.log("To  run tests, run `derw test` from the package directory");
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

    if (!isInPackageDirectory) {
        console.log("Must run tests from the root of a package directory.");
        process.exit(1);
    }

    if (program.flags.watch.isPresent) {
        let timer: any;
        chokidar
            .watch(path.join(process.cwd(), "src"))
            .on("all", async (event: Event, path: string): Promise<any> => {
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
