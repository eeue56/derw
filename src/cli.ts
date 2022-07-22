#!/usr/bin/env ts-node
import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";

type CliCommand =
    | "init"
    | "compile"
    | "test"
    | "install"
    | "info"
    | "repl"
    | "bundle"
    | "format"
    | "template";

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
        case "template":
            return Ok("template");
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
    console.log("Available commands:");
    console.log(
        [
            "init",
            "compile",
            "test",
            "install",
            "info",
            "repl",
            "bundle",
            "format",
            "template",
        ].join(" | ")
    );
}

export async function main(): Promise<number> {
    const command = parseCliCommand();

    if (command.kind === "Err") {
        console.log(command.error);
        showCommandHelp();
        process.exit(1);
    }

    const argv = process.argv;
    const { fileExists } = await import("./cli/utils");
    const isInPackageDirectory = await fileExists("derw-package.json");

    switch (command.value) {
        case "compile": {
            const { compileFiles } = await import("./cli/compile");

            await compileFiles(isInPackageDirectory, argv);
            return 0;
        }
        case "init": {
            const { init } = await import("./cli/init");
            await init(isInPackageDirectory, argv);
            return 0;
        }
        case "install": {
            const { install } = await import("./cli/install");
            await install(isInPackageDirectory, argv);
            return 0;
        }
        case "test": {
            const { runTests } = await import("./cli/testing");
            await runTests(isInPackageDirectory, argv);
            return 0;
        }
        case "info": {
            const { info } = await import("./cli/info");
            await info(isInPackageDirectory, argv);
            return 0;
        }
        case "repl": {
            const { repl } = await import("./cli/repl");
            await repl(isInPackageDirectory, argv);
            return 0;
        }
        case "bundle": {
            const { bundle } = await import("./cli/bundle");
            await bundle(isInPackageDirectory, argv);
            return 0;
        }
        case "format": {
            const { format } = await import("./cli/format");
            await format(isInPackageDirectory, argv);
            return 0;
        }
        case "template": {
            const { template } = await import("./cli/template");
            await template(isInPackageDirectory, argv);
            return 0;
        }
    }
}

if (require.main === module) {
    main();
}
