async function sayHi(name: string): Promise<void> {
    await globalThis.console.log("Hello", name);
    return undefined;
}
