function isFunctionOrConst(line: string): boolean {
    return !line.startsWith("type ") && !line.startsWith(" ");
}

export function intoBlocks(body: string): string[] {
    const blocks = [ ];

    let currentBlock = [ ];
    let isInBlock = false;
    const lines = body.split("\n");
    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isPreviousFunctionDef =
            i === 0 ? false : isFunctionOrConst(lines[i - 1]);
        const inFunctionDef = isFunctionOrConst(line);
        const isIndentedLine = line.startsWith(" ");

        if (isInBlock) {
            if (isIndentedLine || (inFunctionDef && isPreviousFunctionDef)) {
                currentBlock.push(line);
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
    }

    if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
    }

    return blocks;
}
