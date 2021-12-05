type BuiltinTypes = "boolean" | "number" | "string" | "void";

export function isBuiltinType(
    potentialType: string
): potentialType is BuiltinTypes {
    return (
        [ "boolean", "number", "string", "void" ].indexOf(potentialType) > -1
    );
}
