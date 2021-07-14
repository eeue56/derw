export function intoBlocks(body: string): string[] {
    const blocks = [ ];

    let currentBlock = [ ];
    const lines = body.split("\n");
    for (var i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (currentBlock.length > 0 && !line.startsWith(" ")) {
            blocks.push(currentBlock.join("\n").trim());
            currentBlock = [ ];
        } else {
            currentBlock.push(line);
        }
    }

    if (currentBlock.length > 0) {
        blocks.push(currentBlock.join("\n"));
    }

    return blocks;
}
