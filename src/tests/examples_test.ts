import { readFile, readdir } from "fs/promises";
import * as assert from "assert";
import { parse } from "../parser";
import { generateTypescript } from "../generator";
import path from "path/posix";

export async function testExamples() {
    // TODO: renewable once string support is a thing
    return;
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
            const generated = generateTypescript(parsed);
            assert.deepStrictEqual(
                generated,
                tsContents,
                `Failed to correctly generate ${derw}`
            );
        })
    );
}
