import { readdir, readFile } from "fs/promises";
import path from "path";
import { generateDerw } from "../generators/Derw";
import { generateElm } from "../generators/elm";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";

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

async function getFilePairs(): Promise<{ derw: string }[]> {
    const exampleFiles: string[] = (await readdir("./examples")).map((file) =>
        path.join("examples", file)
    );

    const aocFiles = await (
        await adventOfCodeFiles()
    ).map((file) => path.join(adventOfCodePath, file));

    const files: string[] = exampleFiles.concat(aocFiles);

    const filePairs = files
        .filter((file) => file.endsWith("derw"))
        .map((derwFile) => {
            return {
                derw: derwFile,
            };
        });

    return filePairs;
}

export async function benchWarmUpCache() {
    for (var i = 0; i < 10; i++) {
        await getFilePairs();
    }
}

export async function benchParsingExamples() {
    const filePairs = await getFilePairs();
    await Promise.all(
        filePairs.map(async ({ derw }) => {
            const derwContents = (await readFile(derw)).toString();
            parse(derwContents);
        })
    );
}

export async function benchGeneratingDerwExamples() {
    const filePairs = await getFilePairs();
    await Promise.all(
        filePairs.map(async ({ derw }) => {
            const derwContents = (await readFile(derw)).toString();
            generateDerw(parse(derwContents));
        })
    );
}

export async function benchGeneratingTsExamples() {
    const filePairs = await getFilePairs();
    await Promise.all(
        filePairs.map(async ({ derw }) => {
            const derwContents = (await readFile(derw)).toString();
            generateTypescript(parse(derwContents));
        })
    );
}

export async function benchGeneratingJavascriptExamples() {
    const filePairs = await getFilePairs();
    await Promise.all(
        filePairs.map(async ({ derw }) => {
            const derwContents = (await readFile(derw)).toString();
            generateJavascript(parse(derwContents));
        })
    );
}

export async function benchGeneratingElmExamples() {
    const filePairs = await getFilePairs();
    await Promise.all(
        filePairs.map(async ({ derw }) => {
            const derwContents = (await readFile(derw)).toString();
            generateElm(parse(derwContents));
        })
    );
}
