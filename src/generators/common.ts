import { ListDestructure } from "../types";

export function prefixLines(body: string, indent: number): string {
    return body
        .split("\n")
        .map((line) =>
            line.trim().length === 0 ? line : " ".repeat(indent) + line
        )
        .join("\n");
}

export function destructureLength(pattern: ListDestructure): number {
    let length = 0;

    for (let i = 0; i < pattern.parts.length; i++) {
        const part = pattern.parts[i];

        if (
            part.kind === "Destructure" ||
            part.kind === "StringValue" ||
            part.kind === "FormatStringValue"
        ) {
            length++;
        } else if (part.kind === "EmptyList") {
            // ignore empty lists
        } else if (part.kind === "Value") {
            // values can have either no elements or some elements
            // so we don't count it towards the total
            // a value is a gap if it's not the first element
            if (i === 0) length++;
        }
    }
    return length;
}
export function patternGapPositions(pattern: ListDestructure): number[] {
    const positions = [ ];
    for (let i = 0; i < pattern.parts.length; i++) {
        const part = pattern.parts[i];
        if (
            part.kind === "Destructure" ||
            part.kind === "StringValue" ||
            part.kind === "FormatStringValue"
        ) {
        } else if (part.kind === "EmptyList") {
        } else if (part.kind === "Value") {
            // a value is a gap if it's not the first element
            if (i > 0) positions.push(i);
        }
    }
    return positions;
}
export function patternHasGaps(pattern: ListDestructure): boolean {
    for (let i = 0; i < pattern.parts.length; i++) {
        const part = pattern.parts[i];
        if (
            part.kind === "Destructure" ||
            part.kind === "StringValue" ||
            part.kind === "FormatStringValue"
        ) {
        } else if (part.kind === "EmptyList") {
        } else if (part.kind === "Value") {
            // a value is a gap if it's not the first element
            if (i > 0) return true;
        }
    }
    return false;
}
