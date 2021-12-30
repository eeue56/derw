#!/usr/bin/env ts-node
import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { compileFiles } from "./cli/compile";
import { init } from "./cli/init";
import { install } from "./cli/install";
import { runTests } from "./cli/testing";
import { fileExists } from "./cli/utils";

type CliCommand = "init" | "compile" | "test" | "install";

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
}

export async function main(): Promise<number> {
    const command = parseCliCommand();

    if (command.kind === "err") {
        console.log(command.error);
        showCommandHelp();
        process.exit(1);
    }

    const isInPackageDirectory = await fileExists("derw-package.json");

    switch (command.value) {
        case "compile": {
            await compileFiles(isInPackageDirectory);
            return 0;
        }
        case "init": {
            await init(isInPackageDirectory);
            return 0;
        }
        case "install": {
            await install(isInPackageDirectory);
            return 0;
        }
        case "test": {
            await compileFiles(isInPackageDirectory);
            await runTests(isInPackageDirectory);
            return 0;
        }
    }
}

if (require.main === module) {
    main();
}
