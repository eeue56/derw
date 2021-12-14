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

    blocks.forEach((block, i) => {
        let name;
        switch (block.kind) {
            case "Export":
            case "Import": {
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

        if (Object.keys(seenNames).indexOf(name) === -1) {
            seenNames[name] = [ i ];
        } else {
            seenNames[name].push(i);
        }
    });

    for (const name of Object.keys(seenNames)) {
        const indexes = seenNames[name];

        if (indexes.length === 1) break;

        collisionsFound.push(Collision(name, indexes));
    }

    return collisionsFound;
}
