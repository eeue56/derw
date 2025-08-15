import {
    allErrors,
    bothFlag,
    empty,
    help,
    longFlag,
    oneOf,
    parse,
    parser,
    string,
} from "@eeue56/baner";
import { writeFile } from "fs/promises";
import { install } from "./install";
import { fileExists } from "./utils";

type TemplateType = "web" | "html";
const validTemplates = ["web", "html"];

const templateParser = parser([
    longFlag("path", "path of Derw file to create", string()),
    longFlag("template", "Template to use", oneOf(validTemplates)),
    bothFlag("h", "help", "This help text", empty()),
]);

function showInfoHelp() {
    console.log("Generate a Derw file from a template.");
    console.log("Also installs required packages.");
    console.log(help(templateParser));
}

async function copyWebTemplate(path: string): Promise<void> {
    const template =
        `
import "../derw-packages/derw-lang/html/src/Html" exposing ( HtmlNode, RunningProgram, div, text, program, attribute, class_ )

type alias Model = {
}

initialModel: Model
initialModel =
    { }

type Msg =
    Noop

update: Msg -> Model -> (Msg -> void) -> Model
update msg model send =
    case msg of
        Noop ->
            model

view: Model -> HtmlNode Msg
view model =
    div [ ] [ ] [ text "Hello" ]

root: any
root =
    document.getElementById "root"

main: RunningProgram Model Msg
main =
    program {
        initialModel: initialModel,
        view: view,
        update: update,
        root: root
    }
    `.trim() + "\n";

    if (await fileExists(path)) {
        console.log("Already a file!");
        process.exit(1);
    }

    await writeFile(path, template);
}

async function copyHtmlTemplate(path: string): Promise<void> {
    const template =
        `
<!doctype html>
<html>
    <body>
        <div id="root"></div>
        <script type="text/javascript" src="build.js"></script>
    </body>
</html>
    `.trim() + "\n";

    if (await fileExists(path)) {
        console.log("Already a file!");
        process.exit(1);
    }

    await writeFile(path, template);
}

export async function template(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const program = parse(templateParser, argv);

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

    const path =
        program.flags.path.isPresent &&
        program.flags.path.arguments.kind === "Ok" &&
        (program.flags.path.arguments.value as string);

    const template =
        program.flags.template.isPresent &&
        program.flags.template.arguments.kind === "Ok" &&
        (program.flags.template.arguments.value as TemplateType);

    if (!path) {
        console.log("You must provide a path via --path");
        return;
    }

    if (template === "web") {
        await copyWebTemplate(path);
        await install(isInPackageDirectory, [
            "--name",
            "derw-lang/html",
            "--version",
            "main",
        ]);
    } else if (template === "html") {
        await copyHtmlTemplate(path);
    } else {
        console.log(
            `Template ${template} is unknown. Try one of: ${validTemplates.join(", ")}`
        );
    }
}
