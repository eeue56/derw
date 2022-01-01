import { writeFile } from "fs/promises";
import path from "path";
import { exportPackage, Package } from "../package";
import { ensureDirectoryExists, fileExists } from "./utils";

async function copyTSconfig() {
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

    if (await fileExists("tsconfig.json")) {
        console.log("Already got a tsconfig!");
        return -1;
    }

    await writeFile("tsconfig.json", JSON.stringify(tsconfig, null, 4));
}

export async function init(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const packageName = path.basename(process.cwd());

    const package_ = Package(packageName, [ ], [ ]);

    if (isInPackageDirectory) {
        console.log("Package already initialized!");
        process.exit(-1);
    }

    await writeFile("derw-package.json", exportPackage(package_));
    await copyTSconfig();
    await ensureDirectoryExists("src");

    console.log("Project initialized!");
    console.log("Put your files in `src`");
    console.log("Compile your project via `derw compile`");
    console.log("Run tests via `derw test`");
}
