import * as assert from "@eeue56/ts-assert";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { generateDerw } from "../generators/Derw";
import { parse } from "../parser";

const emptyLineAtEndOfFile = "\n";

export async function testStdlibAreConsistentlyParsed() {
    const exampleFiles: string[] = await (
        await readdir("../derw-lang/stdlib/src")
    ).map((file) => path.join("../derw-lang/stdlib/src", file));

    const files: string[] = exampleFiles;

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
