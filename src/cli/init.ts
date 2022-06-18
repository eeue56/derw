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
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { exportPackage, Package } from "../package";
import { ensureDirectoryExists, fileExists } from "./utils";

const initParser = parser([
    longFlag(
        "dir",
        "name of a directory to use as package name e.g stdlib. Defaults to current folder's name",
        string()
    ),
    bothFlag("h", "help", "This help text", empty()),
]);

function showInfoHelp() {
    console.log(help(initParser));
}

async function copyTSconfig(dir: string): Promise<void> {
    const tsconfig = {
        compilerOptions: {
            target: "es2017",
            module: "commonjs",
            declaration: true,
            outDir: "./build/",
            rootDirs: [ "src" ],
            strict: true,
            moduleResolution: "node",
            types: [ "node" ],
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
        },
        include: [ "src/**/*" ],
        exclude: [ "node_modules/**" ],
    };

    if (await fileExists(path.join(dir, "tsconfig.json"))) {
        console.log("Already got a tsconfig!");
        process.exit(1);
    }

    await writeFile(
        path.join(dir, "tsconfig.json"),
        JSON.stringify(tsconfig, null, 4)
    );
}

async function appendGitIgnore(dir: string): Promise<void> {
    let gitIgnore = "";
    const gitIgnorePath = path.join(dir, ".gitignore");

    try {
        gitIgnore = await (await readFile(gitIgnorePath)).toString();
    } catch (e) {}

    gitIgnore =
        gitIgnore +
        `

# derw

derw-packages/
src/**/*.ts
`;

    await writeFile(gitIgnorePath, gitIgnore);
}

async function appendGitAttributes(dir: string): Promise<void> {
    let gitAttributes = "";
    const gitAttributesPath = path.join(dir, ".gitattributes");

    try {
        gitAttributes = await (await readFile(gitAttributesPath)).toString();
    } catch (e) {}

    gitAttributes =
        gitAttributes +
        `
*.derw linguist-language=Elm
*.derw gitlab-language=elm
`.trim();

    await writeFile(gitAttributesPath, gitAttributes);
}

export async function init(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const program = parse(initParser, argv);

    if (program.flags["h/help"].isPresent) {
        showInfoHelp();
        return;
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }

    const dir =
        program.flags.dir.isPresent && program.flags.dir.arguments.kind === "ok"
            ? (program.flags.dir.arguments.value as string)
            : process.cwd();

    const packageName = path.basename(dir);

    const package_ = Package(packageName, [ ], [ ]);

    if (isInPackageDirectory) {
        console.log("Package already initialized!");
        process.exit(-1);
    }

    await writeFile(
        path.join(dir, "derw-package.json"),
        exportPackage(package_)
    );
    await copyTSconfig(dir);
    await appendGitIgnore(dir);
    await appendGitAttributes(dir);
    await ensureDirectoryExists(path.join(dir, "src"));

    console.log("Project initialized!");
    console.log("Put your files in `src`");
    console.log("Compile your project via `derw compile`");
    console.log("Run tests via `derw test`");
}
