import {
    Just,
    map,
    Maybe,
    Nothing,
    withDefault,
} from "@eeue56/ts-core/build/main/lib/maybe";

function isFunctionOrConst(line: string): boolean {
    return !line.startsWith("type ") && !line.startsWith(" ");
}

function isType(line: string): boolean {
    return line.startsWith("type ");
}

function getPreviousRootLine(lines: string[]): Maybe<string> {
    for (var i = lines.length - 1; i >= 0; i--) {
        const isIndented = lines[i].startsWith(" ");

        if (!isIndented) {
            return Just(lines[i]);
        }
    }
    return Nothing();
}

export function intoBlocks(body: string): string[] {
    const blocks = [ ];

    let currentBlock: string[] = [ ];
    let isInBlock = false;
    const lines = body.split("\n");
    const registeredLines = [ ];

    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];
        // empty line
        if (line.trim().length === 0) continue;

        // very first line
        const isFirstLine = registeredLines.length === 0;

        // get the previous line with 0 indentation
        const previousRootLine: Maybe<string> = isFirstLine
            ? Nothing()
            : getPreviousRootLine(registeredLines.map((i) => lines[i]));

        // was the previous root line a type definition?
        const isPreviousLineATypeDef = withDefault(
            false,
            map((line) => isType(line), previousRootLine)
        );

        // was the previous root line a function definition?
        const isPreviousLineAFunctionDef = withDefault(
            false,
            map((line) => isFunctionOrConst(line), previousRootLine)
        );

        // is the current line a function or a constant?
        const inFunctionDef = isFunctionOrConst(line);

        // is the current line a type definition?
        const isTypeDef = isType(line);

        // is the line indented, i.e not a root line
        const isIndentedLine = line.startsWith(" ");

        if (isInBlock) {
            // if we have a new type def being made
            if (isTypeDef && isPreviousLineATypeDef) {
                blocks.push(currentBlock.join("\n").trim());

                currentBlock = [ line ];
                isInBlock = true;
            } else if (
                isIndentedLine ||
                (inFunctionDef &&
                    isPreviousLineAFunctionDef &&
                    !isPreviousLineATypeDef)
            ) {
                currentBlock.push(line);
            } else if (isPreviousLineATypeDef) {
                blocks.push(currentBlock.join("\n").trim());

                currentBlock = [ line ];
                isInBlock = true;
            } else {
                blocks.push(currentBlock.join("\n").trim());

                currentBlock = [ ];
                isInBlock = false;
            }
        } else {
            if (!isIndentedLine) {
                currentBlock.push(line);
                isInBlock = true;
            }
        }

        registeredLines.push(i);
    }

    if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
    }

    return blocks;
}
