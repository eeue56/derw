export async function version(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    console.log("Version: ", process.env.npm_package_version || "main");
}
