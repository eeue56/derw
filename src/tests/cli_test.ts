import * as assert from "@eeue56/ts-assert";
import { readdir, readFile, rm } from "fs/promises";
import path from "path";
import { main } from "../cli";

const adventOfCodePath = "./examples/advent_of_code";
const emptyLineAtEndOfFile = "\n";

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

export async function testExamples() {
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

    await Promise.all(
        filePairs.map(async ({ derw, ts, js, elm }, index) => {
            const outputDir = `test/temp/${index}`;

            await rm(outputDir, { force: true, recursive: true });

            for (const target of [ "derw", "ts", "js", "elm" ]) {
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
            const generatedTS = (
                await readFile(`${outputDir}/${ts}`)
            ).toString();
            const generatedJS = (
                await readFile(`${outputDir}/${js}`)
            ).toString();
            const generatedElm = (
                await readFile(`${outputDir}/${elm}`)
            ).toString();

            try {
                assert.deepStrictEqual(derwContents, generatedDerw);
                assert.deepStrictEqual(tsContents, generatedTS);
                assert.deepStrictEqual(jsContents, generatedJS);
                assert.deepStrictEqual(elmContents, generatedElm);
            } catch (e) {
                console.log(`Failed to correctly generate ${derw}`);
                throw e;
            }
        })
    );
}
