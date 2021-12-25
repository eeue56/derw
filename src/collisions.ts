import { Block } from "./types";

type Collision = {
    kind: "Collision";
    name: string;
    indexes: number[];
};

function Collision(name: string, indexes: number[]): Collision {
    return {
        kind: "Collision",
        indexes,
        name,
    };
}

export function collisions(blocks: Block[]): Collision[] {
    let collisionsFound = [ ];
    let seenNames: Record<string, number[]> = {};
    let seenModules: Record<string, number[]> = {};

    blocks.forEach((block, i) => {
        function incrementTimesSeen(name: string): void {
            if (Object.keys(seenNames).indexOf(name) === -1) {
                seenNames[name] = [ i ];
            } else {
                seenNames[name].push(i);
            }
        }

        function incrementTimesSeenModules(name: string): void {
            if (Object.keys(seenModules).indexOf(name) === -1) {
                seenModules[name] = [ i ];
            } else {
                seenModules[name].push(i);
            }
        }

        let name;
        switch (block.kind) {
            case "Comment":
            case "MultilineComment":
            case "Export": {
                return;
            }
            case "Import": {
                for (const module of block.modules) {
                    for (const exposed of module.exposing) {
                        incrementTimesSeen(exposed);
                    }

                    if (module.alias.kind === "just") {
                        incrementTimesSeenModules(module.alias.value);
                    } else {
                        incrementTimesSeenModules(module.name);
                    }
                }
                return;
            }
            case "Function":
            case "Const": {
                name = block.name;
                break;
            }

            case "UnionType":
            case "TypeAlias": {
                name = block.type.name;
                break;
            }
        }

        incrementTimesSeen(name);
    });

    for (const name of Object.keys(seenNames)) {
        const indexes = seenNames[name];

        if (indexes.length === 1) continue;

        collisionsFound.push(Collision(name, indexes));
    }

    for (const name of Object.keys(seenModules)) {
        const indexes = seenModules[name];

        if (indexes.length === 1) continue;

        collisionsFound.push(Collision(name, indexes));
    }

    return collisionsFound;
}
