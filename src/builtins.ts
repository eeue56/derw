type BuiltinTypes = "boolean" | "number" | "string";

export function isBuiltinType(
    potentialType: string
): potentialType is BuiltinTypes {
    return [ "boolean", "number", "string" ].indexOf(potentialType) > -1;
}
