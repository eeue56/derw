import * as assert from "@eeue56/ts-assert";
import { access, readdir, readFile, rm } from "fs/promises";
import path from "path";
import { main } from "../cli";
import { ensureDirectoryExists } from "../cli/utils";

const adventOfCodePath = "./examples/advent_of_code";

async function adventOfCodeFiles(): Promise<string[]> {
    const days = await readdir(adventOfCodePath);

    let aocFiles: string[] = [ ];

    for (const day of days) {
        const files = await (
            await readdir(path.join(adventOfCodePath, day))
        ).map((file) => path.join(day, file));
        aocFiles = aocFiles.concat(
            files.filter((file) => file.endsWith("derw"))
        );
    }

    return aocFiles;
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

export async function testInit() {
    await rm("test/package", { force: true, recursive: true });

    await ensureDirectoryExists("test/package");
    process.argv = [ "", "", "init", "--dir", "test/package" ];
    await main();

    const doesDerwPackageExist = await fileExists(
        "test/package/derw-package.json"
    );
    assert.deepStrictEqual(doesDerwPackageExist, true);

    const doesTsConfigExist = await fileExists("test/package/tsconfig.json");
    assert.deepStrictEqual(doesTsConfigExist, true);

    const doesSrcExist = await fileExists("test/package/src");
    assert.deepStrictEqual(doesSrcExist, true);
}

export async function testCompileExamples() {
    const exampleFiles: string[] = await (
        await readdir("./examples")
    ).map((file) => path.join("examples", file));

    const aocFiles = await (
        await adventOfCodeFiles()
    ).map((file) => path.join(adventOfCodePath, file));

    const files: string[] = exampleFiles.concat(aocFiles);

    const filePairs = files
        .filter((file) => file.endsWith("derw"))
        .map((derwFile) => {
            return {
                derw: derwFile,
                ts: derwFile.split(".")[0] + ".ts",
                js: derwFile.split(".")[0] + ".js",
                elm: derwFile.split(".")[0] + ".elm",
            };
        });

    await rm("test/temp", { force: true, recursive: true });

    let index = 0;

    for (const pair of filePairs) {
        const { derw, ts, js, elm } = pair;
        const outputDir = `test/temp/${index}`;
        index++;

        for (const target of [ "ts", "js", "elm", "derw" ]) {
            process.argv = [
                "",
                "",
                "compile",
                "--files",
                derw,
                "--output",
                outputDir,
                "--target",
                target,
                "--quiet",
            ];
            await main();
        }

        const derwContents = (await readFile(derw)).toString();
        const tsContents = (await readFile(ts)).toString();
        const jsContents = (await readFile(js)).toString();
        const elmContents = (await readFile(elm)).toString();

        const generatedDerw = (
            await readFile(`${outputDir}/${derw}`)
        ).toString();
        const generatedTS = (await readFile(`${outputDir}/${ts}`)).toString();
        const generatedJS = (await readFile(`${outputDir}/${js}`)).toString();
        const generatedElm = (await readFile(`${outputDir}/${elm}`)).toString();

        try {
            assert.deepStrictEqual(derwContents, generatedDerw);
            assert.deepStrictEqual(tsContents, generatedTS);
            assert.deepStrictEqual(jsContents, generatedJS);
            assert.deepStrictEqual(elmContents, generatedElm);
        } catch (e) {
            console.log(`Failed to correctly generate ${derw}`);
            throw e;
        }
    }
}
