import * as assert from "@eeue56/ts-assert";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { generateDerw } from "../derw_generator";
import { generateTypescript } from "../generator";
import { parse } from "../parser";

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
    const files = await readdir("./examples");

    const filePairs = files
        .filter((file) => file.endsWith("derw"))
        .map((derwFile) => {
            return {
                derw: path.join("examples", derwFile),
                ts: path.join("examples", derwFile.split(".")[0] + ".ts"),
            };
        });

    await Promise.all(
        filePairs.map(async ({ derw, ts }) => {
            const derwContents = (await readFile(derw)).toString();
            const tsContents = (await readFile(ts)).toString();

            const parsed = parse(derwContents);
            const generated = generateTypescript(parsed) + emptyLineAtEndOfFile;

            try {
                assert.deepStrictEqual(tsContents, generated);
            } catch (e) {
                console.log(`Failed to correctly generate ${derw}`);
                throw e;
            }
        })
    );
}

export async function testExamplesAreConsistentlyParsed() {
    const exampleFiles: string[] = await (
        await readdir("./examples")
    ).map((file) => path.join("examples", file));

    const aocFiles = await (
        await adventOfCodeFiles()
    ).map((file) => path.join(adventOfCodePath, file));

    const files: string[] = exampleFiles.concat(aocFiles);

    const filePairs = files.filter((file) => file.endsWith("derw"));

    await Promise.all(
        filePairs.map(async (derw) => {
            const derwContents = (await readFile(derw)).toString();

            const parsed = parse(derwContents);
            const generated = generateDerw(parsed) + emptyLineAtEndOfFile;
            const secondParsed = parse(generated);
            const secondGenerated =
                generateDerw(secondParsed) + emptyLineAtEndOfFile;

            try {
                assert.deepStrictEqual(parsed.errors, [ ]);
                assert.deepStrictEqual(generated, secondGenerated);
                assert.deepStrictEqual(parsed, secondParsed);
            } catch (e) {
                console.log("generated", generated);
                console.log("second generated", secondGenerated);
                console.log(`Failed to correctly generate ${derw}`);
                throw e;
            }
        })
    );
}

export async function testMismatchingTypesGivesErrors() {
    const derwContents = (
        await readFile("./examples/errors/mismatching_types.derw")
    ).toString();
    const parsed = parse(derwContents);

    assert.deepStrictEqual(parsed.errors.length, 2);
}

export async function testNameCollisions() {
    const derwContents = (
        await readFile("./examples/errors/name_collisions.derw")
    ).toString();
    const parsed = parse(derwContents);

    assert.deepStrictEqual(parsed.errors.length, 2);
}
