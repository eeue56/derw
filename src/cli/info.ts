import {
    allErrors,
    bothFlag,
    empty,
    help,
    longFlag,
    parse,
    parser,
    string,
} from "@eeue56/baner";
import { withDefault } from "@eeue56/ts-core/build/main/lib/maybe";
import {
    Const,
    ContextModule,
    Export,
    Function,
    Import,
    ImportModule,
    TypeAlias,
    UnionType,
} from "../types";
import { compileFiles } from "./compile";

const infoParser = parser([
    longFlag(
        "file",
        "name of a particular file to get info about e.g src/Html.derw",
        string()
    ),
    bothFlag("h", "help", "This help text", empty()),
]);

function showInfoHelp() {
    console.log(help(infoParser));
}

function importModuleInfo(module: ImportModule): void {
    const aliasExtra = withDefault(module.name, module.alias);
    console.log(`Importing ${module.name} as ${aliasExtra}`);
    if (module.exposing.length > 0) {
        console.log(`Exposing ${module.exposing.join(", ")}`);
    }
}

function moduleInfo(fileName: string, module: ContextModule): void {
    console.log(`Analyizing ${fileName}...`);

    const imports = module.body.filter((b) => b.kind === "Import") as Import[];
    console.log(`Imports ${imports.length} modules...`);

    for (const import_ of imports) {
        for (const module_ of import_.modules) {
            importModuleInfo(module_);
            console.log("------------------------");
        }
    }

    const exportBlocks = module.body.filter(
        (b) => b.kind === "Export"
    ) as Export[];
    let exportNames: string[] = [];

    for (const export_ of exportBlocks) {
        exportNames = exportNames.concat(export_.names);
    }

    console.log(`Exports ${exportNames.length} values and functions...`);
    if (exportNames.length > 0) {
        console.log(`${exportNames.join(", ")}`);
    }

    console.log("------------------------");

    const functionNames = (
        module.body.filter((b) => b.kind === "Function") as Function[]
    ).map((f) => f.name);

    const nonExportedFunctionNames = functionNames.filter(
        (f) => exportNames.indexOf(f) === -1
    );

    console.log("Unexported functions");
    console.log(nonExportedFunctionNames.join(", "));
    console.log("------------------------");

    const constNames = (
        module.body.filter((b) => b.kind === "Const") as Const[]
    ).map((f) => f.name);

    const nonExportedConstNames = constNames.filter(
        (f) => exportNames.indexOf(f) === -1
    );

    console.log("Unexported consts");
    console.log(nonExportedConstNames.join(", "));
    console.log("------------------------");

    const missingUnionTypes = [];
    const unionTypes = module.body.filter(
        (b) => b.kind === "UnionType"
    ) as UnionType[];

    for (const unionType of unionTypes) {
        const isRootTypeExported =
            exportNames.indexOf(unionType.type.name) > -1;
        const missingTagNames = [];

        for (const tag of unionType.tags) {
            if (exportNames.indexOf(tag.name) === -1) {
                missingTagNames.push(tag.name);
            }
        }

        if (!isRootTypeExported || missingTagNames.length > 0) {
            if (isRootTypeExported) {
                missingUnionTypes.push(
                    `Type ${unionType.type.name} is exported but the constructors ${missingTagNames.join(", ")} are not`
                );
            } else {
                missingUnionTypes.push(
                    `${unionType.type.name}(${missingTagNames.join(", ")})`
                );
            }
        }
    }

    console.log("Unexported union types");
    console.log(missingUnionTypes.join("\n "));
    console.log("------------------------");

    const typeAliasNames = (
        module.body.filter((b) => b.kind === "TypeAlias") as TypeAlias[]
    ).map((f) => f.type.name);

    const nonExportedTypeAliasNames = typeAliasNames.filter(
        (f) => exportNames.indexOf(f) === -1
    );

    console.log("Unexported type aliases");
    console.log(nonExportedTypeAliasNames.join(", "));
    console.log("------------------------");
}

export async function info(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const program = parse(infoParser, argv);
    if (program.flags["h/help"].isPresent) {
        showInfoHelp();
        return;
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }

    const fileNameToParse =
        program.flags.file.isPresent &&
        program.flags.file.arguments.kind === "Ok" &&
        (program.flags.file.arguments.value as string);

    if (!isInPackageDirectory && !fileNameToParse) {
        console.log(
            "No derw-package.json found. Maybe you need to run `derw init` first?"
        );
        console.log("Or provide a file to analyize via --file.");
        process.exit(1);
    }

    let parsedFiles;

    if (fileNameToParse) {
        parsedFiles = await compileFiles(isInPackageDirectory, [
            "--files",
            fileNameToParse,
            "--quiet",
        ]);
    } else {
        parsedFiles = await compileFiles(isInPackageDirectory, ["--quiet"]);
    }

    for (const fileName of Object.keys(parsedFiles)) {
        if (fileNameToParse && fileNameToParse !== fileName) {
            continue;
        }
        moduleInfo(fileName, parsedFiles[fileName]);
    }
}
