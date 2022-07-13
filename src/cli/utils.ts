import { promises } from "fs";
import { readdir } from "fs/promises";
import path from "path";

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

export async function getDerwFiles(dir: string): Promise<string[]> {
    try {
        const lstat = await promises.lstat(dir);
        if (!lstat.isDirectory()) {
            return [ dir ];
        }
    } catch (error) {}

    let files: string[] = [ ];

    for (const file of await readdir(dir, { withFileTypes: true })) {
        if (file.isFile()) {
            if (file.name.endsWith("derw")) {
                files.push(path.join(dir, file.name));
            }
        } else if (file.isDirectory()) {
            if (file.name === "node_modules") {
            } else {
                files = files.concat(
                    await getDerwFiles(path.join(dir, file.name))
                );
            }
        }
    }

    return files;
}
