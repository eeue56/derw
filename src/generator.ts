import { generateDerw } from "./derw_generator";
import { generateElm } from "./elm_generator";
import { generateJavascript } from "./js_generator";
import { generateTypescript } from "./ts_generator";
import { Module } from "./types";

const emptyLineAtEndOfFile = "\n";

export type Target = "js" | "ts" | "derw" | "elm";

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
    }
}
