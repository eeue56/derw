import { deepStrictEqual } from "@eeue56/ts-assert";
import { Err, Ok } from "@eeue56/ts-core/build/main/lib/result";
import { decodePackage, Dependency, Package, PackageModule } from "../package";

export function testValidPackageWithNoModules() {
    const packageJson = {
        name: "stdlib",
        exposing: [],
        dependencies: {},
    };

    deepStrictEqual(decodePackage(packageJson), Ok(Package("stdlib", [], [])));
}

export function testValidPackageWithModules() {
    const packageJson = {
        name: "stdlib",
        exposing: ["List", "Maybe", "Test"],
        dependencies: {},
    };

    deepStrictEqual(
        decodePackage(packageJson),
        Ok(
            Package(
                "stdlib",
                [
                    PackageModule("List"),
                    PackageModule("Maybe"),
                    PackageModule("Test"),
                ],
                []
            )
        )
    );
}

export function testValidPackageWithDependencies() {
    const packageJson = {
        name: "stdlib",
        exposing: ["List", "Maybe", "Test"],
        dependencies: {
            result: "1.0.0",
        },
    };

    deepStrictEqual(
        decodePackage(packageJson),
        Ok(
            Package(
                "stdlib",
                [
                    PackageModule("List"),
                    PackageModule("Maybe"),
                    PackageModule("Test"),
                ],
                [Dependency("result", "1.0.0")]
            )
        )
    );
}

export function testValidPackageWithExtraJson() {
    const packageJson = {
        name: "stdlib",
        exposing: [],
        dependencies: {},
        somethingUnused: true,
    };

    deepStrictEqual(decodePackage(packageJson), Ok(Package("stdlib", [], [])));
}

export function testInvalidPackageWithMissingName() {
    const packageJson = {
        exposing: [],
    };

    deepStrictEqual(
        decodePackage(packageJson),
        Err('Error parsing name due to "undefined" is not a string')
    );
}
