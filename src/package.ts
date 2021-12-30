import {
    array,
    decode,
    map,
    pipeline,
    record,
    required,
    string,
} from "@eeue56/adeilad";
import { Result } from "@eeue56/ts-core/build/main/lib/result";

export type PackageModule = {
    kind: "PackageModule";
    name: string;
};

export function PackageModule(name: string): PackageModule {
    return {
        kind: "PackageModule",
        name,
    };
}

export type Dependency = {
    kind: "Dependency";
    name: string;
    version: string;
};

export function Dependency(name: string, version: string): Dependency {
    return {
        kind: "Dependency",
        name,
        version,
    };
}

export function dependenciesFromRecord(
    record: Record<string, string>
): Dependency[] {
    const dependencies = [ ];

    for (const entry of Object.keys(record)) {
        dependencies.push(Dependency(entry, record[entry]));
    }

    return dependencies;
}

export type Package = {
    kind: "Package";
    name: string;
    exposing: PackageModule[];
    dependencies: Dependency[];
};

export function Package(
    name: string,
    exposing: PackageModule[],
    dependencies: Dependency[]
): Package {
    return {
        kind: "Package",
        name,
        exposing,
        dependencies,
    };
}

const packageDecoder = pipeline(
    [
        required("name", string()),
        required("exposing", array(map(PackageModule, string()))),
        required("dependencies", map(dependenciesFromRecord, record(string()))),
    ],
    Package
);

export function exportPackage(package_: Package): string {
    const dependencies: Record<string, string> = {};

    for (const dependency of package_.dependencies) {
        dependencies[dependency.name] = dependency.version;
    }

    return JSON.stringify(
        {
            name: package_.name,
            exposing: package_.exposing.map((e) => e.name),
            dependencies: dependencies,
        },
        null,
        4
    );
}

export function decodePackage(potentialPackage: any): Result<string, Package> {
    return decode(packageDecoder, potentialPackage);
}
