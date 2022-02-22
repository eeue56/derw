export function getNameFromPath(path: string) {
    return path.split("/").slice(-1)[0].split(".")[0];
}

/*
Taken from https://stackoverflow.com/a/7616484
*/
export function hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

export function isTestFile(name: string): boolean {
    return name.endsWith("_test.derw");
}
