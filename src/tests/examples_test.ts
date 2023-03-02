import * as assert from "@eeue56/ts-assert";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { generateDerw } from "../generators/Derw";
import { generateElm } from "../generators/Elm";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
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

    for (const filePair of filePairs) {
        const { derw, ts, js, elm } = filePair;
        const derwContents = (await readFile(derw)).toString();
        const tsContents = (await readFile(ts)).toString();
        const jsContents = (await readFile(js)).toString();
        const elmContents = (await readFile(elm)).toString();

        const parsed = parse(derwContents, derw);
        const generatedTS = generateTypescript(parsed) + emptyLineAtEndOfFile;
        const generatedJS = generateJavascript(parsed) + emptyLineAtEndOfFile;
        const generatedElm = generateElm(parsed) + emptyLineAtEndOfFile;

        try {
            assert.deepStrictEqual(tsContents, generatedTS);
            assert.deepStrictEqual(jsContents, generatedJS);
            assert.deepStrictEqual(elmContents, generatedElm);
        } catch (e) {
            console.log(`Failed to correctly generate ${derw}`);
            throw e;
        }
    }
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

    for (const derw of filePairs) {
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
    }
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
