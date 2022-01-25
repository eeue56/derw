import { readFile, writeFile } from "fs/promises";
import { generate } from "../generator";
import { parseWithContext } from "../parser";
import { contextModuleToModule } from "../types";
import { getDerwFiles } from "./utils";

export async function format(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    if (!isInPackageDirectory) {
        console.log("derw format must be run from inside a package directory");
        process.exit(-1);
    }

    const files = await getDerwFiles("./src");

    for (const file of files) {
        const derwContents = (await readFile(file)).toString();

        let parsed = parseWithContext(derwContents, "Main");

        if (parsed.errors.length > 0) {
            console.log(`Failed to parse ${file}`);
            continue;
        }

        const outputDerw = generate("derw", contextModuleToModule(parsed));

        await writeFile(file, outputDerw);
    }
}
