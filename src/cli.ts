#!/usr/bin/env ts-node
import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { bundle } from "./cli/bundle";
import { compileFiles } from "./cli/compile";
import { format } from "./cli/format";
import { info } from "./cli/info";
import { init } from "./cli/init";
import { install } from "./cli/install";
import { repl } from "./cli/repl";
import { runTests } from "./cli/testing";
import { fileExists } from "./cli/utils";

type CliCommand =
    | "init"
    | "compile"
    | "test"
    | "install"
    | "info"
    | "repl"
    | "bundle"
    | "format";

function parseCliCommand(): Result<string, CliCommand> {
    if (typeof process.argv[2] === "undefined") {
        return Err("No command provided.");
    }

    switch (process.argv[2]) {
        case "init":
            return Ok("init");
        case "compile":
            return Ok("compile");
        case "test":
            return Ok("test");
        case "install":
            return Ok("install");
        case "info":
            return Ok("info");
        case "repl":
            return Ok("repl");
        case "bundle":
            return Ok("bundle");
        case "format":
            return Ok("format");
        default: {
            return Err(`Unknown command \`${process.argv[2]}\``);
        }
    }
}

function showCommandHelp(): void {
    console.log("To get started:");
    console.log("Start a package via `init`");
    console.log("Compile via `compile`");
    console.log("Or compile and test via `test`");
    console.log("Or get info about a file or package via `info`");
}

export async function main(): Promise<number> {
    const command = parseCliCommand();

    if (command.kind === "err") {
        console.log(command.error);
        showCommandHelp();
        process.exit(1);
    }

    const argv = process.argv;
    const isInPackageDirectory = await fileExists("derw-package.json");

    switch (command.value) {
        case "compile": {
            await compileFiles(isInPackageDirectory, argv);
            return 0;
        }
        case "init": {
            await init(isInPackageDirectory, argv);
            return 0;
        }
        case "install": {
            await install(isInPackageDirectory, argv);
            return 0;
        }
        case "test": {
            await runTests(isInPackageDirectory, argv);
            return 0;
        }
        case "info": {
            await info(isInPackageDirectory, argv);
            return 0;
        }
        case "repl": {
            await repl(isInPackageDirectory, argv);
            return 0;
        }
        case "bundle": {
            await bundle(isInPackageDirectory, argv);
            return 0;
        }
        case "format": {
            await format(isInPackageDirectory, argv);
            return 0;
        }
    }
}

if (require.main === module) {
    main();
}
