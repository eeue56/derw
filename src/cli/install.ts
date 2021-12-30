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
import { readFile, writeFile } from "fs/promises";
import { decodePackage, Dependency, exportPackage } from "../package";

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

    if (program.flags.name.isPresent) {
        const name = (program.flags.name.arguments as Ok<string>).value;

        let version = "master;";
        if (program.flags.version.isPresent) {
            version = (program.flags.version.arguments as Ok<string>).value;
        }

        if (!isQuiet) console.log("Reading derw-package.json...");

        const packageFile = decodePackage(
            JSON.parse(await (await readFile("derw-package.json")).toString())
        );

        if (packageFile.kind === "err") {
            console.log("Failed to parse package file due to:");
            console.log(packageFile.error);
            process.exit(1);
        }

        const validPackage = packageFile.value;
        validPackage.dependencies.push(Dependency(name, version));

        if (!isQuiet) {
            console.log(
                `Writing new package ${name}@${version} to derw-package.json...`
            );
        }
        await writeFile("derw-package.json", exportPackage(validPackage));

        if (!isQuiet) console.log("Done!");
        return;
    }
}
