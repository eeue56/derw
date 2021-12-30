import {
    bothFlag,
    empty,
    help,
    longFlag,
    parse,
    parser,
    string,
} from "@eeue56/baner";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { spawnSync } from "child_process";
import { readFile, writeFile } from "fs/promises";
import {
    addDependency,
    decodePackage,
    Dependency,
    exportPackage,
    Package,
} from "../package";
import { ensureDirectoryExists } from "./utils";

const installParser = parser([
    longFlag("name", "name of the package e.g derw-lang/stdlib", string()),
    longFlag("version", "name of the package e.g derw-lang/stdlib", string()),
    longFlag("quiet", "Keep it short and sweet", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showInstallHelp(): void {
    console.log(
        "To install a new package run `derw install --name {package name} --version {version}`"
    );
    console.log(
        "Or run me without args inside a package directory to install all packages in derw-package.json"
    );
    console.log(help(installParser));
}

export async function install(isInPackageDirectory: boolean): Promise<void> {
    if (!isInPackageDirectory) {
        console.log(
            "No derw-package.json found. Maybe you need to run `derw init` first?"
        );
        process.exit(1);
    }

    const program = parse(installParser, process.argv);
    if (program.flags["h/help"].isPresent) {
        showInstallHelp();
        return;
    }

    const isQuiet = program.flags.quiet.isPresent;

    const isInstallNewPackage = program.flags.name.isPresent;
    const packageFile = decodePackage(
        JSON.parse(await (await readFile("derw-package.json")).toString())
    );

    if (packageFile.kind === "err") {
        console.log("Failed to parse package file due to:");
        console.log(packageFile.error);
        process.exit(1);
    }

    let validPackage = packageFile.value;

    if (isInstallNewPackage) {
        const name = (program.flags.name.arguments as Ok<string>).value;

        let version = "master;";
        if (program.flags.version.isPresent) {
            version = (program.flags.version.arguments as Ok<string>).value;
        }

        if (!isQuiet) console.log("Reading derw-package.json...");

        validPackage = addDependency(Dependency(name, version), validPackage);

        if (!isQuiet) {
            console.log(
                `Writing new package ${name}@${version} to derw-package.json...`
            );
        }
        await writeFile("derw-package.json", exportPackage(validPackage));

        if (!isQuiet) console.log("Done!");
    }

    if (validPackage.dependencies.length === 0) {
        console.log("No dependencies to install!");
        return;
    } else {
        if (!isQuiet) console.log("Installing packages...");
        await installPackages(validPackage, isQuiet);
        if (!isQuiet)
            console.log(
                `Installed ${validPackage.dependencies.length} packages`
            );
    }
}

async function installPackages(
    validPackage: Package,
    isQuiet: boolean
): Promise<void> {
    await ensureDirectoryExists("derw-packages");

    for (const dependency of validPackage.dependencies) {
        if (!isQuiet)
            console.log(`Fetching ${dependency.name}@${dependency.version}...`);
        await cloneRepo(dependency);
        await checkoutRef(dependency);
    }
}

async function cloneRepo(dependency: Dependency): Promise<void> {
    await ensureDirectoryExists(`derw-packages/${dependency.name}`);
    const res = spawnSync(
        "git",
        [ "clone", `git@github.com:${dependency.name}.git`, dependency.name ],
        { cwd: "derw-packages", encoding: "utf-8" }
    );

    if (res.error) {
        console.log(`Encountered error cloning ${dependency.name}`);
        console.log(res.error);
    }
}

async function checkoutRef(dependency: Dependency) {
    let res = spawnSync("git", [ "fetch", `origin`, `${dependency.version}` ], {
        cwd: `derw-packages/${dependency.name}`,

        encoding: "utf-8",
    });

    if (res.error) {
        console.log(`Encountered error cloning ${dependency.name}`);
        console.log(res.error);
    }

    res = spawnSync("git", [ "checkout", `${dependency.version}` ], {
        cwd: `derw-packages/${dependency.name}`,

        encoding: "utf-8",
    });

    if (res.error) {
        console.log(`Encountered error cloning ${dependency.name}`);
        console.log(res.error);
    }
}
