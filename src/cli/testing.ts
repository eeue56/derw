import { runner } from "@eeue56/bach/build/bach";

export async function runTests(isInPackageDirectory: boolean): Promise<void> {
    if (!isInPackageDirectory) {
        console.log("Must run tests from the root of a package directory.");
        process.exit(1);
    }

    await runner();
}
