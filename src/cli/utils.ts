import { promises } from "fs";

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
