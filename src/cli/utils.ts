import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { promises } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { suggestName } from "../errors/distance";

export async function fileExists(name: string): Promise<boolean> {
    try {
        await promises.access(name);
    } catch (e) {
        return false;
    }
    return true;
}

export async function ensureDirectoryExists(directory: string): Promise<void> {
    try {
        const lstat = await promises.lstat(directory);
        if (!lstat.isDirectory()) {
            await promises.mkdir(directory, { recursive: true });
        }
    } catch (error) {
        await promises.mkdir(directory, { recursive: true });
    }
}

export async function getDerwFiles(
    dir: string
): Promise<Result<string, string[]>> {
    try {
        const lstat = await promises.lstat(dir);
        if (!lstat.isDirectory()) {
            return Ok([dir]);
        }
    } catch (error) {
        return Err(`${error}`);
    }

    let files: string[] = [];

    for (const file of await readdir(dir, { withFileTypes: true })) {
        if (file.isFile()) {
            if (file.name.endsWith("derw")) {
                files.push(path.join(dir, file.name));
            }
        } else if (file.isDirectory()) {
            if (file.name === "node_modules") {
            } else {
                const nested = await getDerwFiles(path.join(dir, file.name));
                if (nested.kind === "Ok") {
                    files = files.concat(nested.value);
                } else {
                    return nested;
                }
            }
        }
    }

    return Ok(files);
}

export async function getFlatFiles(
    files: string[]
): Promise<Result<string, string[]>> {
    const nestedFiles = await Promise.all(
        files.map(async (file) => await getDerwFiles(file))
    );
    let returnedFiles: string[] = [];

    for (const innerFiles of nestedFiles) {
        if (innerFiles.kind === "Err") {
            return Err(`Failed to find the file ${innerFiles.error}`);
        } else {
            returnedFiles = returnedFiles.concat(innerFiles.value);
        }
    }

    return Ok(returnedFiles);
}

export async function suggestFileNames(fullPath: string): Promise<string> {
    const dir = path.dirname(fullPath);
    const files = await getDerwFiles(dir);

    if (files.kind === "Err") {
        return `I couldn't find a directory called ${dir}`;
    }

    const suggestions = suggestName(fullPath, files.value);

    if (suggestions.length === 0) {
        return `I couldn't find the file ${fullPath} and have no suggestions.`;
    }

    return `I couldn't find the file ${fullPath}. Maybe you meant ${suggestions.join(",")}?`;
}
