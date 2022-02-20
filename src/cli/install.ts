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
import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { spawnSync } from "child_process";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import {
    addDependency,
    decodePackage,
    Dependency,
    exportPackage,
    loadPackageFile,
    Package,
} from "../package";
import { ensureDirectoryExists, fileExists } from "./utils";

const installParser = parser([
    longFlag("name", "name of the package e.g derw-lang/stdlib", string()),
    longFlag("version", "name of the package e.g main or master", string()),
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

export async function install(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    if (!isInPackageDirectory) {
        console.log(
            "No derw-package.json found. Maybe you need to run `derw init` first?"
        );
        process.exit(1);
    }

    const program = parse(installParser, argv);
    if (program.flags["h/help"].isPresent) {
        showInstallHelp();
        return;
    }

    const isQuiet = program.flags.quiet.isPresent;

    const isInstallNewPackage = program.flags.name.isPresent;
    const packageFile = await loadPackageFile("derw-package.json");

    if (packageFile.kind === "err") {
        console.log("Failed to parse package file due to:");
        console.log(packageFile.error);
        process.exit(1);
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }
    let validPackage = packageFile.value;

    if (isInstallNewPackage) {
        const name = (program.flags.name.arguments as Ok<string>).value;

        let version = "main";
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

function isPackageAlreadyThere(
    package_: Package,
    packages: Package[]
): boolean {
    for (const p of packages) {
        if (package_.name === p.name) return true;
    }
    return false;
}

async function installPackages(
    validPackage: Package,
    isQuiet: boolean
): Promise<Package[]> {
    await ensureDirectoryExists("derw-packages");
    const installedPackages: Package[] = [ ];

    for (const dependency of validPackage.dependencies) {
        if (!isQuiet)
            console.log(`Fetching ${dependency.name}@${dependency.version}...`);

        const depPackage = await fetchDependencyPackage(dependency);

        if (depPackage.kind === "ok") {
            if (!isPackageAlreadyThere(depPackage.value, installedPackages)) {
                const subpackages = await installPackages(
                    depPackage.value,
                    isQuiet
                );

                for (const subpackage of subpackages) {
                    installedPackages.push(subpackage);
                }
            }
        }

        await cloneRepo(dependency);
        await checkoutRef(dependency);

        if (await fileExists(`derw-packages/${dependency.name}/package.json`)) {
            if (!isQuiet) console.log("Installing npm packages...");
            await npmInstall(dependency);
        }

        if (depPackage.kind === "ok") {
            installedPackages.push(depPackage.value);
        }
    }

    return installedPackages;
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
        console.log(`Encountered error fetching ${dependency.name}`);
        console.log(res.error);
    }

    res = spawnSync(
        "git",
        [ "reset", "--hard", `origin/${dependency.version}` ],
        {
            cwd: `derw-packages/${dependency.name}`,
            encoding: "utf-8",
        }
    );

    if (res.error) {
        console.log(`Encountered error checkout ${dependency.name}`);
        console.log(res.error);
    }

    res = spawnSync("git", [ "reset", "--hard", `${dependency.version}` ], {
        cwd: `derw-packages/${dependency.name}`,
        encoding: "utf-8",
    });

    if (res.error) {
        console.log(`Encountered error checkout ${dependency.name}`);
        console.log(res.error);
    }
}

async function npmInstall(dependency: Dependency): Promise<void> {
    const res = spawnSync("npm", [ "install" ], {
        cwd: `derw-packages/${dependency.name}`,
        encoding: "utf-8",
    });

    if (res.error) {
        console.log(
            `Encountered error installing npm packages from ${dependency.name}`
        );
        console.log(res.error);
    }
}

async function fetchDependencyPackage(
    dependency: Dependency
): Promise<Result<string, Package>> {
    try {
        const response = await fetch(
            `https://raw.githubusercontent.com/${dependency.name}/${dependency.version}/derw-package.json`
        );
        return decodePackage(await response.json());
    } catch (error) {
        console.log(error);
        return Err(`Failed to fetch ${dependency.name}@${dependency.version}`);
    }
}
