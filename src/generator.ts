import { generateDerw } from "./generators/Derw";
import { generateElm } from "./generators/Elm";
import { generateEnglish } from "./generators/English";
import { generateJavascript } from "./generators/Js";
import { generateTypescript } from "./generators/Ts";
import { Module } from "./types";

const emptyLineAtEndOfFile = "\n";

export type Target = "js" | "ts" | "derw" | "elm" | "english";

export function generate(target: Target, parsed: Module): string {
    switch (target) {
        case "js": {
            return generateJavascript(parsed) + emptyLineAtEndOfFile;
        }
        case "ts": {
            return generateTypescript(parsed) + emptyLineAtEndOfFile;
        }
        case "derw": {
            return generateDerw(parsed) + emptyLineAtEndOfFile;
        }
        case "elm": {
            return generateElm(parsed) + emptyLineAtEndOfFile;
        }
        case "english": {
            return generateEnglish(parsed) + emptyLineAtEndOfFile;
        }
    }
}
