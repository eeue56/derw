type BuiltinTypes = "boolean" | "number" | "string" | "void" | "any";

export function isBuiltinType(
    potentialType: string
): potentialType is BuiltinTypes {
    return (
        [ "boolean", "number", "string", "void", "any" ].indexOf(
            potentialType
        ) > -1
    );
}
