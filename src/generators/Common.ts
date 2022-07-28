import * as List from "../stdlib/List";

import { ListDestructure, ListDestructurePart } from "../types";

export { prefixLines };
export { destructureLength };
export { patternGapPositions };
export { patternHasGaps };

function prefixLines(body: string, indent: number): string {
    function lineFn(line: string): string {
        if (line.trim() === "") {
            return line;
        } else {
            return `${" ".repeat(indent)}${line}`;
        }
    }
    return (function(y: any) {
        return y.join("\n");
    })(List.map(lineFn, body.split("\n")));
}

function partLength(part: ListDestructurePart, index: number): number {
    switch (part.kind) {
        case "Destructure": {
            return 1;
        }
        case "StringValue": {
            return 1;
        }
        case "FormatStringValue": {
            return 1;
        }
        case "EmptyList": {
            return 0;
        }
        case "Value": {
            if (index === 0) {
                return 1;
            } else {
                return 0;
            };
        }
    }
}

function destructureLength(pattern: ListDestructure): number {
    return List.foldl(function(x: any, y: any) {
        return x + y;
    }, 0, List.indexedMap(partLength, pattern.parts));
}

type GapPositionInfo = {
    i: number;
    positions: number[];
}

function GapPositionInfo(args: { i: number, positions: number[] }): GapPositionInfo {
    return {
        ...args,
    };
}

function patternGapPositions(pattern: ListDestructure): number[] {
    function folder(part: ListDestructurePart, info: GapPositionInfo): GapPositionInfo {
        switch (part.kind) {
            case "Value": {
                if (info.i > 0) {
                    return {
                        i: info.i - 1,
                        positions: [ info.i, ...info.positions ]
                    };
                } else {
                    return { ...info, i: info.i - 1 };
                };
            }
            default: {
                return { ...info, i: info.i - 1 };
            }
        }
    }
    return (function(y: any) {
        return y.positions;
    })(List.foldr(folder, {
        i: pattern.parts.length - 1,
        positions: [ ]
    }, pattern.parts));
}

function patternHasGaps(pattern: ListDestructure): boolean {
    function hasGap(index: number, xs: ListDestructurePart[]): boolean {
        switch (xs.length) {
            case xs.length: {
                if (xs.length >= 1) {
                    const [ x, ...ys ] = xs;
                    switch (x.kind) {
                    case "Value": {
                        if (index > 0) {
                            return true;
                        } else {
                            return hasGap(index + 1, ys);
                        };
                    }
                    default: {
                        return hasGap(index + 1, ys);
                    }
                };
                }
            }
            default: {
                return false;
            }
        }
    }
    return hasGap(0, pattern.parts);
}
