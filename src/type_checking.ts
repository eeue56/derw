import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { isBuiltinType } from "./builtins";
import { suggestName } from "./errors/distance";
import { generateExpression } from "./generators/Derw";
import {
    Addition,
    And,
    Block,
    Branch,
    CaseStatement,
    Const,
    Constructor,
    Division,
    Equality,
    Expression,
    FixedType,
    FormatStringValue,
    Function,
    FunctionCall,
    FunctionType,
    GenericType,
    GreaterThan,
    GreaterThanOrEqual,
    IfStatement,
    Import,
    InEquality,
    Lambda,
    LambdaCall,
    LeftPipe,
    LessThan,
    LessThanOrEqual,
    ListPrepend,
    ListRange,
    ListValue,
    Mod,
    ModuleReference,
    Multiplication,
    ObjectLiteral,
    ObjectLiteralType,
    Or,
    Property,
    RightPipe,
    StringValue,
    Subtraction,
    Tag,
    TagArg,
    Type,
    TypeAlias,
    TypedBlock,
    UnionType,
    UnionUntaggedType,
    Value,
} from "./types";

type ScopedValues = Record<string, Type>;

function isSameGenericType(
    first: GenericType,
    second: GenericType,
    topLevel: boolean
): boolean {
    if (topLevel) return true;
    // todo: figure this out
    //return first.name === second.name;
    return true;
}

function isSameFixedType(
    first: FixedType,
    second: FixedType,
    topLevel: boolean
): boolean {
    if (
        (first.name === "any" && first.args.length === 0) ||
        (second.name === "any" && second.args.length === 0)
    ) {
        return true;
    }

    if (first.args.length !== second.args.length) {
        return false;
    }

    if (first.name !== second.name) return false;

    for (var i = 0; i < first.args.length; i++) {
        if (!isSameType(first.args[i], second.args[i], topLevel)) {
            return false;
        }
    }

    return true;
}

function isSameFunctionType(
    first: FunctionType,
    second: FunctionType,
    topLevel: boolean
): boolean {
    if (first.args.length !== second.args.length) {
        return false;
    }

    for (var i = 0; i < first.args.length; i++) {
        if (!isSameType(first.args[i], second.args[i], topLevel)) {
            return false;
        }
    }

    return true;
}

function doesFunctionTypeContainType(
    first: FunctionType,
    second: GenericType | FixedType,
    topLevel: boolean
): boolean {
    switch (second.kind) {
        case "GenericType": {
            for (const arg of first.args) {
                if (isSameType(arg, second, topLevel)) {
                    return true;
                }
            }
        }
        case "FixedType": {
            for (const arg of first.args) {
                if (isSameType(arg, second, topLevel)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isSameObjectLiteralType(
    first: ObjectLiteralType,
    second: ObjectLiteralType
): boolean {
    const processedNames = [];

    for (const firstPropertyName of Object.keys(first.properties)) {
        if (second.properties[firstPropertyName]) {
            // when the types don't match between first and second
            if (
                !isSameType(
                    first.properties[firstPropertyName],
                    second.properties[firstPropertyName],
                    false
                )
            ) {
                return false;
            }
            processedNames.push(firstPropertyName);
        } else {
            // when one property exists on first but not second
            return false;
        }
    }

    for (const secondPropertyName of Object.keys(second.properties)) {
        if (!processedNames.includes(secondPropertyName)) {
            // when one property exists on second but not first
            return false;
        }
    }

    return true;
}

function isSameObjectLiteralTypeAlias(
    objectLiteral: ObjectLiteralType,
    expectedType: Type,
    typedBlocks: TypedBlock[]
): boolean {
    if (expectedType.kind === "GenericType") return true;
    const expectedTypeAlias = getTypeAlias(expectedType, typedBlocks);
    if (expectedTypeAlias.kind === "Err") return false;
    const typeAlias = expectedTypeAlias.value;

    const processedNames = [];

    for (const property of typeAlias.properties) {
        if (objectLiteral.properties[property.name]) {
            if (
                !isSameType(
                    property.type,
                    objectLiteral.properties[property.name],
                    false
                )
            ) {
                return false;
            } else {
                processedNames.push(property.name);
            }
        } else {
            return false;
        }
    }

    for (const property of Object.keys(objectLiteral.properties)) {
        if (!processedNames.includes(property)) {
            // when one property exists on second but not first
            return false;
        }
    }

    return true;
}

function tagToFixedType(tag: Tag): FixedType {
    return FixedType(
        tag.name,
        tag.args
            .filter((tag) => tag.type.kind === "GenericType")
            .map((arg) => arg.type)
    );
}

function isATag(type_: Type, typedBlocks: TypedBlock[]): Result<null, Type> {
    for (const block of typedBlocks) {
        switch (block.kind) {
            case "UnionType": {
                for (const tag of block.tags) {
                    const tagType = tagToFixedType(tag);

                    if (isSameType(type_, tagType, false))
                        return Ok(block.type);
                }
            }
        }
    }

    return Err(null);
}

export function isSameType(
    first: Type,
    second: Type,
    topLevel: boolean,
    typedBlocks: TypedBlock[] = []
): boolean {
    if (
        first.kind === "ObjectLiteralType" &&
        second.kind === "ObjectLiteralType"
    ) {
        return isSameObjectLiteralType(first, second);
    }

    if (
        (first.kind !== "FunctionType" &&
            first.kind !== "ObjectLiteralType" &&
            first.name === "any") ||
        (second.kind !== "FunctionType" &&
            second.kind !== "ObjectLiteralType" &&
            second.name === "any")
    ) {
        return true;
    }

    if (
        (first.kind === "ObjectLiteralType" && second.kind === "GenericType") ||
        (second.kind === "ObjectLiteralType" && first.kind === "GenericType")
    ) {
        return true;
    }

    if (
        first.kind === "ObjectLiteralType" ||
        second.kind === "ObjectLiteralType"
    ) {
        return false;
    }

    if (first.kind !== second.kind) {
        if (first.kind === "FunctionType" && second.kind !== "FunctionType") {
            return doesFunctionTypeContainType(first, second, topLevel);
        }

        if (first.kind === "FixedType" && second.kind === "GenericType") {
            return true;
        }

        if (second.kind === "FixedType" && first.kind === "GenericType") {
            return true;
        }
        return false;
    }

    switch (first.kind) {
        case "FixedType": {
            if (first.name.indexOf(".") > -1) {
                const split = first.name.split(".");
                first = {
                    ...first,
                    name: split[split.length - 1],
                };
            }
            second = second as FixedType;
            if (second.name.indexOf(".") > -1) {
                const split = second.name.split(".");
                second = {
                    ...second,
                    name: split[split.length - 1],
                };
            }

            if (isSameFixedType(first, second, topLevel)) {
                return true;
            }

            const isFirstATag = isATag(first, typedBlocks);
            const isSecondATag = isATag(second, typedBlocks);

            if (isFirstATag.kind === "Ok") {
                if (
                    isSameType(isFirstATag.value, second, topLevel, typedBlocks)
                ) {
                    return true;
                }
            }

            if (isSecondATag.kind === "Ok") {
                if (
                    isSameType(first, isSecondATag.value, topLevel, typedBlocks)
                ) {
                    return true;
                }
            }

            return false;
        }
        case "GenericType": {
            return isSameGenericType(first, second as GenericType, topLevel);
        }
        case "FunctionType": {
            return isSameFunctionType(first, second as FunctionType, topLevel);
        }
    }
}

function inferValue(
    value: Value,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Type {
    if (parseInt(value.body, 10)) {
        return FixedType("number", []);
    }

    if (value.body === "true" || value.body === "false") {
        return FixedType("boolean", []);
    }

    if (value.body === "toString") {
        if (valuesInScope[`_${value.body}`]) {
            return valuesInScope[`_${value.body}`];
        }
    } else {
        if (valuesInScope[value.body]) {
            return valuesInScope[value.body];
        }
    }

    return FixedType("any", []);
}

function inferStringValue(value: StringValue): Type {
    return FixedType("string", []);
}

function inferFormatStringValue(value: FormatStringValue): Type {
    return FixedType("string", []);
}

function reduceTypes(types: Type[]): Type[] {
    return types.reduce((uniques: Type[], type) => {
        if (
            uniques.filter((unique) => isSameType(unique, type, false))
                .length === 0
        ) {
            uniques.push(type);
        }
        return uniques;
    }, []);
}

function inferListValue(
    value: ListValue,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    if (value.items.length === 0)
        return Ok(FixedType("List", [FixedType("any", [])]));

    let types: Type[] = [];

    let actualExpectedType: Type = FixedType("_Inferred", []);
    if (
        expectedType.kind === "FixedType" &&
        expectedType.name === "List" &&
        expectedType.args.length > 0
    ) {
        actualExpectedType = expectedType.args[0];
    }

    for (const item of value.items) {
        const inferred = inferType(
            item,
            actualExpectedType,
            typedBlocks,
            imports,
            valuesInScope
        );
        if (inferred.kind === "Err") return inferred;
        types.push(inferred.value);
    }

    const uniqueTypes = reduceTypes(types);

    return Ok(FixedType("List", uniqueTypes));
}

function inferListRange(value: ListRange): Type {
    return FixedType("List", [FixedType("number", [])]);
}

function objectLiteralTypeAlias(
    value: ObjectLiteral,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): TypeAlias {
    const expectedTypeAlias = getTypeAlias(expectedType, typedBlocks);

    const typeAlias = TypeAlias(
        FixedType("Inferred", []),
        value.fields.map((field) => {
            const listOfExpected =
                expectedTypeAlias.kind === "Ok"
                    ? expectedTypeAlias.value.properties.filter(
                          (prop) => prop.name === field.name
                      )
                    : [];
            const expected =
                listOfExpected.length === 0
                    ? FixedType("_Inferred", [])
                    : listOfExpected[0].type;
            const inferred = inferType(
                field.value,
                expected,
                typedBlocks,
                imports,
                valuesInScope
            );
            if (inferred.kind === "Err") {
                return Property(field.name, GenericType("any"));
            }

            return Property(field.name, inferred.value);
        })
    );

    return typeAlias;
}

function objectLiteralType(typeAlias: TypeAlias): ObjectLiteralType {
    const fields: Record<string, Type> = {};

    for (const prop of typeAlias.properties) {
        fields[prop.name] = prop.type;
    }

    return ObjectLiteralType(fields);
}

function typeAliasFromObjectLiteralType(
    objectLiteral: ObjectLiteralType
): TypeAlias {
    const fields: Property[] = [];

    for (const name of Object.keys(objectLiteral.properties)) {
        const type_ = objectLiteral.properties[name];
        fields.push(Property(name, type_));
    }

    return TypeAlias(FixedType("Inferred", []), fields);
}

function inferObjectLiteral(
    value: ObjectLiteral,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    if (value.base !== null) {
        return Ok(FixedType("any", []));
    }

    const typeAlias = objectLiteralTypeAlias(
        value,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (
        expectedType.kind !== "FixedType" ||
        expectedType.name === "_Inferred"
    ) {
        return Ok(objectLiteralType(typeAlias));
    }

    for (const block of typedBlocks) {
        if (
            block.kind != "TypeAlias" ||
            block.properties.length !== typeAlias.properties.length ||
            expectedType.name !== block.type.name
        ) {
            continue;
        }

        let blockMatches = true;

        for (const inferredProperty of typeAlias.properties) {
            const hasMatchingBlockProperty =
                block.properties.filter((prop) => {
                    return (
                        prop.name === inferredProperty.name &&
                        isSameType(prop.type, inferredProperty.type, false)
                    );
                }).length > 0;

            if (!hasMatchingBlockProperty) {
                blockMatches = false;
                break;
            }
        }
        if (blockMatches) {
            return Ok(block.type);
        }
    }

    return Ok(objectLiteralType(typeAlias));
}

function inferIfStatement(
    value: IfStatement,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const ifBranch = inferType(
        value.ifBody,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const elseBranch = inferType(
        value.elseBody,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (ifBranch.kind === "Err") return ifBranch;
    if (elseBranch.kind === "Err") return elseBranch;

    if (isSameType(ifBranch.value, elseBranch.value, false))
        return Ok(ifBranch.value);

    return Err(
        `Conflicting types: ${typeToString(ifBranch.value)}, ${typeToString(
            elseBranch.value
        )}`
    );
}

function inferBranch(
    value: Branch,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    return inferType(
        value.body,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
}

function inferCaseStatement(
    value: CaseStatement,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const typesToReduce = [];

    for (const branch of value.branches) {
        const inf = inferBranch(
            branch,
            expectedType,
            typedBlocks,
            imports,
            valuesInScope
        );
        if (inf.kind === "Err") return inf;
        typesToReduce.push(inf.value);
    }
    const branches = reduceTypes(typesToReduce);

    if (branches.length === 1) return Ok(branches[0]);

    return Err(`Conflicting types: ${branches.map(typeToString).join(", ")}`);
}

function inferAddition(
    value: Addition,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const left = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const right = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false)) {
        let maybeStringErrorMessage = "";

        if (
            value.left.kind === "StringValue" ||
            value.left.kind === "FormatStringValue"
        ) {
            maybeStringErrorMessage = `\nTry using a format string via \`\` instead\nFor example, \`${
                value.left.body
            }\${${generateExpression(value.right)}}\``;
        } else if (
            value.right.kind === "StringValue" ||
            value.right.kind === "FormatStringValue"
        ) {
            maybeStringErrorMessage = `\nTry using a format string via \`\` instead\nFor example, \`\${${generateExpression(
                value.left
            )}}${value.right.body}\``;
        } else if (
            left.value.kind === "FixedType" &&
            left.value.name === "string"
        ) {
            maybeStringErrorMessage = `\nTry using a format string via \`\` instead\nFor example, \`\${${generateExpression(
                value.left
            )}}\${${generateExpression(value.right)}}\``;
        } else if (
            right.value.kind === "FixedType" &&
            right.value.name === "string"
        ) {
            maybeStringErrorMessage = `\nTry using a format string via \`\` instead\nFor example, \`\${${generateExpression(
                value.left
            )}}\${${generateExpression(value.right)}}\``;
        }

        return Err(
            `Mismatching types between the left of the addition: ${typeToString(
                left.value
            )} and the right of the addition: ${typeToString(
                right.value
            )}\nIn Derw, types of both sides of an addition must be the same.${maybeStringErrorMessage}`
        );
    }
    return left;
}

function inferSubtraction(
    value: Subtraction,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const left = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const right = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferMultiplication(
    value: Multiplication,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const left = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const right = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferDivision(
    value: Division,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const left = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const right = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferMod(
    value: Mod,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const left = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const right = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (left.kind === "Err") return left;
    if (right.kind === "Err") return right;

    if (!isSameType(left.value, right.value, false))
        return Err(
            `Mismatching types between ${typeToString(
                left.value
            )} and ${typeToString(right.value)}`
        );
    return left;
}

function inferLeftPipe(
    value: LeftPipe,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const right = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    return right;
}

function inferRightPipe(
    value: RightPipe,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const left = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    return left;
}

function getTypeAliasAtPath(
    value: ModuleReference,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, TypeAlias> {
    let currentType = valuesInScope[value.path[0]];
    if (!currentType) return Err("");
    let currentTypeAlias = getTypeAlias(currentType, typedBlocks);

    for (const path of value.path.slice(1)) {
        if (currentTypeAlias.kind === "Err") return Err("");

        let found = false;
        for (const prop of currentTypeAlias.value.properties) {
            if (prop.name === path) {
                currentType = prop.type;
                found = true;
                break;
            }
        }
        if (!found) {
            return Err("");
        }

        currentTypeAlias = getTypeAlias(currentType, typedBlocks);
    }

    if (currentTypeAlias.kind === "Err") return Err("");
    return Ok(currentTypeAlias.value);
}

function inferModuleReference(
    value: ModuleReference,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    if (value.path.length > 0) {
        const isAVariablePath =
            value.path[0][0].toLowerCase() === value.path[0][0];
        if (isAVariablePath && value.value.kind === "Value") {
            const typeAlias = getTypeAliasAtPath(
                value,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );

            if (typeAlias.kind === "Ok") {
                for (const prop of typeAlias.value.properties) {
                    if (prop.name === value.value.body) {
                        return Ok(prop.type);
                    }
                }
            }
        }
    }
    return Ok(FixedType("any", []));
}

function inferFunctionCall(value: FunctionCall): Type {
    return FixedType("any", []);
}

function inferLambda(value: Lambda): Type {
    return FixedType("any", []);
}

function inferLambdaCall(value: LambdaCall): Type {
    return FixedType("any", []);
}

function tagNames(typedBlocks: TypedBlock[]): string[] {
    const names = [];

    for (const block of typedBlocks) {
        switch (block.kind) {
            case "TypeAlias": {
                break;
            }
            case "UnionType": {
                for (const tag of block.tags) {
                    names.push(tag.name);
                }
                break;
            }
            case "UnionUntaggedType": {
                break;
            }
        }
    }
    return names;
}

function replaceGenerics(
    type_: Type,
    replacements: Record<string, Type>
): Type {
    if (
        type_.kind === "FunctionType" ||
        type_.kind === "ObjectLiteralType" ||
        type_.kind === "GenericType"
    ) {
        return type_;
    }

    return {
        ...type_,
        args: type_.args.map((arg: Type): Type => {
            if (arg.kind === "GenericType" && arg.name in replacements) {
                return replacements[arg.name];
            } else {
                return arg;
            }
        }),
    };
}

function inferConstructor(
    value: Constructor,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    let seenNameInOtherBlock = false;
    for (const block of typedBlocks) {
        if (block.kind === "UnionType") {
            for (const tag of block.tags) {
                if (value.constructor === tag.name) {
                    const valid = validateConstructor(
                        value.pattern,
                        expectedType,
                        tag,
                        block,
                        typedBlocks,
                        imports,
                        valuesInScope
                    );

                    const inferredGenericTypes: Record<string, Type> = {};

                    for (const arg of tag.args) {
                        if (arg.type.kind === "GenericType") {
                            for (const field of value.pattern.fields) {
                                if (arg.name === field.name) {
                                    const fieldIsValid = inferType(
                                        field.value,
                                        arg.type,
                                        typedBlocks,
                                        imports,
                                        valuesInScope
                                    );
                                    if (fieldIsValid.kind === "Ok") {
                                        if (
                                            inferredGenericTypes[
                                                arg.type.name
                                            ] !== fieldIsValid.value
                                        ) {
                                            inferredGenericTypes[
                                                arg.type.name
                                            ] = fieldIsValid.value;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (valid.kind === "Err") return valid;

                    return Ok(
                        replaceGenerics(block.type, inferredGenericTypes)
                    );
                }
            }
        } else if (block.kind === "TypeAlias") {
            if (value.constructor === block.type.name) {
                seenNameInOtherBlock = true;
            }
        }
    }

    if (isImportedConstructor(value, imports)) {
        return Ok(GenericType("any"));
    }

    const suggestions = suggestName(value.constructor, tagNames(typedBlocks));

    const suggestionsErrorMessage =
        suggestions.length === 0
            ? ""
            : `\nPerhaps you meant one of these? ${suggestions.join(", ")}`;

    const hasBeenSeenErrorMesssage = seenNameInOtherBlock
        ? `\n${value.constructor} refers to a type alias, not a union type constructor.`
        : "";

    return Err(
        `Did not find constructor ${value.constructor} in scope.${hasBeenSeenErrorMesssage}${suggestionsErrorMessage}`
    );
}

function inferEquality(value: Equality): Type {
    return FixedType("boolean", []);
}

function inferInEquality(value: InEquality): Type {
    return FixedType("boolean", []);
}

function inferLessThan(value: LessThan): Type {
    return FixedType("boolean", []);
}

function inferLessThanOrEqual(value: LessThanOrEqual): Type {
    return FixedType("boolean", []);
}

function inferGreaterThan(value: GreaterThan): Type {
    return FixedType("boolean", []);
}

function inferGreaterThanOrEqual(value: GreaterThanOrEqual): Type {
    return FixedType("boolean", []);
}

function inferAnd(value: And): Type {
    return FixedType("boolean", []);
}

function inferOr(value: Or): Type {
    return FixedType("boolean", []);
}

function inferListPrepend(
    value: ListPrepend,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    const leftInfer = inferType(
        value.left,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const rightInfer = inferType(
        value.right,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (leftInfer.kind === "Err") {
        if (value.left.kind === "ObjectLiteral") {
            const err = validateObjectLiteral(
                value.left,
                FixedType("_Inferred", []),
                typedBlocks,
                imports,
                valuesInScope
            );

            if (err.kind === "Err") return err;
        }
        return leftInfer;
    }
    if (rightInfer.kind === "Err") return rightInfer;

    if (
        rightInfer.value.kind === "GenericType" ||
        (rightInfer.value.kind === "FixedType" &&
            rightInfer.value.name === "any")
    )
        return Ok(FixedType("List", [GenericType("any")]));
    if (rightInfer.value.kind === "FunctionType") {
        return Err(
            "Inferred list on right hand side of :: to be a function, not a list"
        );
    }
    if (rightInfer.value.kind === "ObjectLiteralType") {
        return Err(
            "Inferred list on right hand side of :: to be an object literal, not a list"
        );
    }

    if (rightInfer.value.name === "List" && rightInfer.value.args.length > 0) {
        const isEmptyList =
            value.right.kind === "ListValue" && value.right.items.length === 0;

        if (isEmptyList) {
            return Ok(FixedType("List", [leftInfer.value]));
        }

        const listElementType = rightInfer.value.args[0];

        if (isSameType(leftInfer.value, listElementType, false)) {
            return Ok(rightInfer.value);
        }
        return Err(
            `Invalid types in :: - lefthand (${typeToString(
                leftInfer.value
            )}) must match elements of righthand (${typeToString(
                listElementType
            )})`
        );
    }

    return Err(
        `Expected list on righthand side of :: but got ${typeToString(
            rightInfer.value
        )}.`
    );
}

export function inferType(
    expression: Expression,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, Type> {
    switch (expression.kind) {
        case "Value":
            return Ok(
                inferValue(
                    expression,
                    expectedType,
                    typedBlocks,
                    imports,
                    valuesInScope
                )
            );
        case "StringValue":
            return Ok(inferStringValue(expression));
        case "FormatStringValue":
            return Ok(inferFormatStringValue(expression));
        case "ListValue":
            return inferListValue(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "ListRange":
            return Ok(inferListRange(expression));
        case "ObjectLiteral":
            return inferObjectLiteral(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "IfStatement":
            return inferIfStatement(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "CaseStatement":
            return inferCaseStatement(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "Addition":
            return inferAddition(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "Subtraction":
            return inferSubtraction(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "Multiplication":
            return inferMultiplication(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "Division":
            return inferDivision(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "Mod":
            return inferMod(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "And":
            return Ok(inferAnd(expression));
        case "Or":
            return Ok(inferOr(expression));
        case "ListPrepend":
            return inferListPrepend(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "LeftPipe":
            return inferLeftPipe(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "RightPipe":
            return inferRightPipe(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "ModuleReference":
            return inferModuleReference(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "FunctionCall":
            return Ok(inferFunctionCall(expression));
        case "Lambda":
            return Ok(inferLambda(expression));
        case "LambdaCall":
            return Ok(inferLambdaCall(expression));
        case "Constructor":
            return inferConstructor(
                expression,
                expectedType,
                typedBlocks,
                imports,
                valuesInScope
            );
        case "Equality":
            return Ok(inferEquality(expression));
        case "InEquality":
            return Ok(inferInEquality(expression));
        case "LessThan":
            return Ok(inferLessThan(expression));
        case "LessThanOrEqual":
            return Ok(inferLessThanOrEqual(expression));
        case "GreaterThan":
            return Ok(inferGreaterThan(expression));
        case "GreaterThanOrEqual":
            return Ok(inferGreaterThanOrEqual(expression));
    }
}

function typeToString(type: Type): string {
    switch (type.kind) {
        case "GenericType": {
            return type.name;
        }
        case "FixedType": {
            const typeArgs =
                type.args.length === 0
                    ? ""
                    : " (" + type.args.map(typeToString).join(" ") + ")";
            return `${type.name}${typeArgs}`.trim();
        }
        case "FunctionType": {
            return type.args.map(typeToString).join("->");
        }
        case "ObjectLiteralType": {
            const out = [];
            for (const name of Object.keys(type.properties)) {
                out.push(`${name}: ${typeToString(type.properties[name])}`);
            }
            return "{ " + out.join(", ") + " }";
        }
    }
}

function typeExistsInNamespace(
    type: Type,
    blocks: TypedBlock[],
    imports: Import[]
): boolean {
    if (type.kind === "FunctionType") return true;
    if (type.kind === "ObjectLiteralType") return true;
    if (isBuiltinType(type.name)) return true;
    if (type.name === "List") return true;
    if (type.kind === "GenericType") return true;

    for (const block of blocks) {
        if (isSameType(type, block.type, true)) return true;

        switch (block.kind) {
            case "UnionType": {
                for (const tag of block.tags) {
                    if (isSameType(type, tagToFixedType(tag), true))
                        return true;
                }
            }
        }
    }

    for (const import_ of imports) {
        for (const module of import_.modules) {
            for (const exposed of module.exposing) {
                if (type.name === exposed) return true;
            }

            if (
                type.name.indexOf(".") > -1 &&
                module.alias.kind === "Just" &&
                type.name.split(".")[0] === module.alias.value
            ) {
                return true;
            }
        }
    }

    return false;
}

function finalExpressions(expression: Expression): string[] {
    switch (expression.kind) {
        case "Value":
            return [];
        case "StringValue":
            return [expression.body];
        case "FormatStringValue":
            return [];
        case "ListValue":
            return [];
        case "ListRange":
            return [];
        case "ObjectLiteral":
            return [];
        case "IfStatement":
            return finalExpressions(expression.ifBody).concat(
                finalExpressions(expression.elseBody)
            );
        case "CaseStatement":
            let expressions: string[] = [];

            for (const branch of expression.branches) {
                expressions = expressions.concat(finalExpressions(branch.body));
            }
            return expressions;
        case "Addition":
            return [];
        case "Subtraction":
            return [];
        case "Multiplication":
            return [];
        case "Division":
            return [];
        case "Mod":
            return [];
        case "And":
            return [];
        case "Or":
            return [];
        case "ListPrepend":
            return [];
        case "LeftPipe":
            return [];
        case "RightPipe":
            return [];
        case "ModuleReference":
            return [];
        case "FunctionCall":
            return [];
        case "Lambda":
            return [];
        case "LambdaCall":
            return [];
        case "Constructor":
            return [];
        case "Equality":
            return [];
        case "InEquality":
            return [];
        case "LessThan":
            return [];
        case "LessThanOrEqual":
            return [];
        case "GreaterThan":
            return [];
        case "GreaterThanOrEqual":
            return [];
    }
}

function allFinalExpressions(block: Block): string[] {
    switch (block.kind) {
        case "Const": {
            return finalExpressions(block.value);
        }
        case "Function": {
            return finalExpressions(block.body);
        }
        default: {
            return [];
        }
    }
}

function validateAllBranchesCovered(
    typedBlocks: TypedBlock[],
    containingBlock: Const | Function,
    expression: CaseStatement
): Result<string, true> {
    const hasDefault =
        expression.branches.filter((b) => b.pattern.kind === "Default").length >
        0;

    const casePattern = expression.predicate;

    let predicateType: Type | null = null;

    if (casePattern.kind === "Value") {
        if (containingBlock.kind === "Function") {
            for (const arg of containingBlock.args) {
                if (arg.kind === "FunctionArg") {
                    if (arg.name === casePattern.body) {
                        predicateType = arg.type;
                    }
                }
            }
        }
    }

    if (predicateType && predicateType?.kind === "FixedType") {
        const matchingBlocks = typedBlocks.filter((b) =>
            isSameType(b.type, predicateType as Type, false)
        );

        if (matchingBlocks.length > 0) {
            const matchingBlock = matchingBlocks[0];
            if (matchingBlock.kind === "UnionUntaggedType") {
                const strings = matchingBlock.values.map((s) => s.body);
                const seenStrings: string[] = [];

                for (const branch of expression.branches) {
                    if (branch.pattern.kind === "StringValue") {
                        seenStrings.push(branch.pattern.body);
                    }
                }

                const missingBranches = strings.filter(
                    (s) => seenStrings.indexOf(s) === -1
                );
                const extraBranches = seenStrings.filter(
                    (s) => strings.indexOf(s) === -1
                );

                let errors = [];
                if (missingBranches.length > 0 && !hasDefault) {
                    errors.push(
                        `All possible branches of a untagged union must be covered. I expected a branch for ${missingBranches
                            .map((s) => `"${s}"`)
                            .join(
                                " | "
                            )} but they were missing. If you don't need one, have a default branch`
                    );
                }
                if (extraBranches.length > 0) {
                    errors.push(
                        `I got too many branches. The branches for ${extraBranches
                            .map((s) => `"${s}"`)
                            .join(
                                " | "
                            )} aren't part of the untagged union so will never be true. Remove them.`
                    );
                }

                if (errors.length > 0) {
                    errors = [
                        `The case statement did not match the untagged union ${typeToString(
                            predicateType
                        )}`,
                        ...errors,
                    ];
                    return Err(errors.join("\n"));
                }

                return Ok(true);
            } else if (matchingBlock.kind === "UnionType") {
                const names = matchingBlock.tags.map((t) => t.name);
                const seenNames: string[] = [];

                for (const branch of expression.branches) {
                    if (branch.pattern.kind === "Destructure") {
                        seenNames.push(branch.pattern.constructor);
                    }
                }

                const missingBranches = names.filter(
                    (s) => seenNames.indexOf(s) === -1
                );
                const extraBranches = seenNames.filter(
                    (s) => names.indexOf(s) === -1
                );

                let errors = [];
                if (missingBranches.length > 0 && !hasDefault) {
                    errors.push(
                        `All possible branches of a union must be covered. I expected a branch for ${missingBranches.join(
                            " | "
                        )} but they were missing. If you don't need one, have a default branch`
                    );
                }
                if (extraBranches.length > 0) {
                    errors.push(
                        `I got too many branches. The branches for ${extraBranches.join(
                            " | "
                        )} aren't part of the union so will never be true. Remove them.`
                    );
                }

                if (errors.length > 0) {
                    errors = [
                        `The case statement did not match the union ${typeToString(
                            predicateType
                        )}`,
                        ...errors,
                    ];
                    return Err(errors.join("\n"));
                }

                return Ok(true);
            }
        }
    }

    return Ok(true);
}

export function getCasesFromFunction(block: Function): CaseStatement[] {
    const body = block.body;

    const statements = [];

    if (body.kind === "CaseStatement") statements.push(body);

    return statements;
}

export function validateAllCasesCovered(
    block: Block,
    typedBlocks: TypedBlock[]
): string[] {
    if (block.kind !== "Function") {
        return [];
    }

    const cases = getCasesFromFunction(block);
    const invalidBranches: string[] = [];

    for (const case_ of cases) {
        const valid = validateAllBranchesCovered(typedBlocks, block, case_);

        if (valid.kind === "Err") {
            invalidBranches.push(valid.error);
        }
    }

    return invalidBranches;
}

export function validateObjectLiteralType(
    objectLiteralType: ObjectLiteralType,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[]
): Result<string, null> {
    const typeAlias = typeAliasFromObjectLiteralType(objectLiteralType);

    if (expectedType.kind !== "FixedType") return Ok(null);

    for (const typeBlock of typedBlocks) {
        if (
            typeBlock.kind === "UnionType" ||
            typeBlock.kind === "UnionUntaggedType" ||
            typeBlock.type.name !== expectedType.name
        )
            continue;

        const missingPropertyFromTypeAlias: Property[] = [];
        const addedProperties: Property[] = [];
        const incorrectProperties: string[] = [];

        for (const property of typeAlias.properties) {
            let found = false;
            for (const typeProperty of typeBlock.properties) {
                if (property.name === typeProperty.name) {
                    if (
                        isImportedType(typeProperty.type, imports) ||
                        isImportedType(property.type, imports)
                    ) {
                        found = true;
                        continue;
                    } else if (
                        !isSameType(property.type, typeProperty.type, false)
                    ) {
                        incorrectProperties.push(
                            `${property.name}: Expected ${typeToString(
                                typeProperty.type
                            )} but got ${typeToString(property.type)}`
                        );
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                addedProperties.push(property);
            }
        }
        for (const typeProperty of typeBlock.properties) {
            let found = false;
            for (const property of typeAlias.properties) {
                if (property.name === typeProperty.name) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missingPropertyFromTypeAlias.push(typeProperty);
            }
        }

        if (
            missingPropertyFromTypeAlias.length > 0 ||
            addedProperties.length > 0 ||
            incorrectProperties.length > 0
        ) {
            let errorMessage = "";
            if (missingPropertyFromTypeAlias.length > 0) {
                if (errorMessage.length > 0) errorMessage += "\n";
                errorMessage += `The type alias had these properties which are missing in this object literal: ${missingPropertyFromTypeAlias
                    .map((prop) => `${prop.name}: ${typeToString(prop.type)}`)
                    .join(" | ")}`;
            }
            if (addedProperties.length > 0) {
                if (errorMessage.length > 0) errorMessage += "\n";
                errorMessage += `The object literal had these properties which aren't in the type alias: ${addedProperties
                    .map((prop) => `${prop.name}: ${typeToString(prop.type)}`)
                    .join(" | ")}`;
            }
            if (incorrectProperties.length > 0) {
                if (errorMessage.length > 0) errorMessage += "\n";
                errorMessage += `Invalid properties: ${incorrectProperties.join(
                    " | "
                )}`;
            }
            return Err(
                `Object literal type alias ${typeToString(
                    typeBlock.type
                )} did not match the value due to:\n${errorMessage}`
            );
        }
    }
    return Ok(null);
}

function getUntaggedUnion(
    type_: Type,
    typedBlocks: TypedBlock[]
): Result<null, UnionUntaggedType> {
    if (type_.kind !== "FixedType") return Err(null);

    for (const block of typedBlocks) {
        if (block.kind !== "UnionUntaggedType") continue;
        if (block.type.name === type_.name) {
            return Ok(block);
        }
    }

    return Err(null);
}

function getTypeAlias(
    type_: Type,
    typedBlocks: TypedBlock[]
): Result<null, TypeAlias> {
    if (type_.kind !== "FixedType") return Err(null);

    for (const block of typedBlocks) {
        if (block.kind !== "TypeAlias") continue;
        if (block.type.name === type_.name) {
            return Ok(block);
        }
    }

    return Err(null);
}

function validateObjectLiteral(
    objectLiteral: ObjectLiteral,
    expectedType: Type,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, null> {
    if (objectLiteral.base !== null) {
        return Ok(null);
    }

    if (expectedType.kind !== "FixedType") return Ok(null);

    const typeAlias = objectLiteralTypeAlias(
        objectLiteral,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );

    for (const typeBlock of typedBlocks) {
        if (
            typeBlock.kind === "UnionType" ||
            typeBlock.kind === "UnionUntaggedType" ||
            typeBlock.type.name !== expectedType.name
        )
            continue;

        const missingPropertyFromTypeAlias: Property[] = [];
        const addedProperties: Property[] = [];
        const incorrectProperties: string[] = [];

        for (const property of typeAlias.properties) {
            let found = false;
            for (const typeProperty of typeBlock.properties) {
                if (property.name === typeProperty.name) {
                    const maybeUntaggedUnionBlock = getUntaggedUnion(
                        typeProperty.type,
                        typedBlocks
                    );
                    if (maybeUntaggedUnionBlock.kind === "Ok") {
                        const fieldValue = objectLiteral.fields.filter(
                            (field) => field.name === property.name
                        )[0];

                        if (!fieldValue) continue;
                        if (fieldValue.value.kind !== "StringValue") continue;
                        const stringFieldValue = (
                            fieldValue.value as StringValue
                        ).body;

                        const isCovered =
                            maybeUntaggedUnionBlock.value.values.filter(
                                (v) => v.body === stringFieldValue
                            ).length > 0;
                        if (!isCovered) {
                            incorrectProperties.push(
                                `${fieldValue.name}: Expected ${typeToString(
                                    maybeUntaggedUnionBlock.value.type
                                )}, composed of ${maybeUntaggedUnionBlock.value.values
                                    .map((v) => `"${v.body}"`)
                                    .join(
                                        " | "
                                    )}\` but got "${stringFieldValue}"`
                            );
                        }
                    } else if (
                        !isSameType(property.type, typeProperty.type, false)
                    ) {
                        incorrectProperties.push(
                            `${property.name}: Expected ${typeToString(
                                typeProperty.type
                            )} but got ${typeToString(property.type)}`
                        );
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                addedProperties.push(property);
            }
        }
        for (const typeProperty of typeBlock.properties) {
            let found = false;
            for (const property of typeAlias.properties) {
                if (property.name === typeProperty.name) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missingPropertyFromTypeAlias.push(typeProperty);
            }
        }

        if (
            missingPropertyFromTypeAlias.length > 0 ||
            addedProperties.length > 0 ||
            incorrectProperties.length > 0
        ) {
            let errorMessage = "";
            if (missingPropertyFromTypeAlias.length > 0) {
                if (errorMessage.length > 0) errorMessage += "\n";
                errorMessage += `The type alias had these properties which are missing in this object literal: ${missingPropertyFromTypeAlias
                    .map((prop) => `${prop.name}: ${typeToString(prop.type)}`)
                    .join(" | ")}`;
            }
            if (addedProperties.length > 0) {
                if (errorMessage.length > 0) errorMessage += "\n";
                errorMessage += `The object literal had these properties which aren't in the type alias: ${addedProperties
                    .map((prop) => `${prop.name}: ${typeToString(prop.type)}`)
                    .join(" | ")}`;
            }
            if (incorrectProperties.length > 0) {
                if (errorMessage.length > 0) errorMessage += "\n";
                errorMessage += `Invalid properties: ${incorrectProperties.join(
                    " | "
                )}`;
            }

            return Err(
                `Mismatching type for type alias ${typeToString(
                    typeBlock.type
                )}\n${errorMessage}`
            );
        }
    }
    return Ok(null);
}

function unifyType(type_: Type, typeReplacements: Record<string, Type>): Type {
    switch (type_.kind) {
        case "FixedType": {
            return {
                ...type_,
                args: type_.args.map((arg) => {
                    return unifyType(arg, typeReplacements);
                }),
            };
        }
        case "FunctionType": {
            return {
                ...type_,
                args: type_.args.map((arg) => {
                    return unifyType(arg, typeReplacements);
                }),
            };
        }
        case "GenericType": {
            return typeReplacements[type_.name] || type_;
        }
        case "ObjectLiteralType": {
            const newProperties: Record<string, Type> = {};

            for (const propName of Object.keys(type_.properties)) {
                const propValue = type_.properties[propName];
                newProperties[propName] = unifyType(
                    propValue,
                    typeReplacements
                );
            }

            return {
                ...type_,
                properties: newProperties,
            };
        }
    }
}

function unifyTag(tag: Tag, typeReplacements: Record<string, Type>): Tag {
    return {
        ...tag,
        args: tag.args.map((arg: TagArg): TagArg => {
            return {
                ...arg,
                type: unifyType(arg.type, typeReplacements),
            };
        }),
    };
}

function unifyUnionType(unionType: UnionType, expectedType: Type): UnionType {
    if (expectedType.kind !== "FixedType") return unionType;
    if (unionType.type.name !== expectedType.name) {
        return unionType;
    }

    const toBeReplaced: Record<string, Type> = {};

    for (var i = 0; i < expectedType.args.length; i++) {
        const currentGenericArg = unionType.type.args[i];
        if (currentGenericArg.kind !== "GenericType") {
            continue;
        }
        const actualFixedArg = expectedType.args[i];

        toBeReplaced[currentGenericArg.name] = actualFixedArg;
    }

    return {
        ...unionType,
        tags: unionType.tags.map((tag) => {
            return unifyTag(tag, toBeReplaced);
        }),
    };
}

function tagTypeAlias(
    tag: Tag,
    genericUnionType: UnionType,
    expectedType: Type,
    typedBlocks: TypedBlock[]
): TypeAlias {
    const unionType = unifyUnionType(genericUnionType, expectedType);

    const tagToUse =
        unionType.tags.filter((localTag) => localTag.name === tag.name)[0] ||
        tag;

    const typeAlias = TypeAlias(
        FixedType("Inferred", []),
        tagToUse.args.map((arg) => {
            return Property(arg.name, arg.type);
        })
    );
    return typeAlias;
}

export function findReplacement(
    inferredType: Type,
    expectedType: Type,
    typedBlocks: TypedBlock[]
): Type {
    switch (inferredType.kind) {
        case "FixedType": {
            if (
                expectedType.kind !== "FixedType" ||
                expectedType.name !== inferredType.name ||
                expectedType.args.length !== inferredType.args.length
            ) {
                return inferredType;
            }

            const args: Type[] = [];

            for (let i = 0; i < inferredType.args.length; i++) {
                const inferredArg = inferredType.args[i];
                const expectedArg = expectedType.args[i];

                args.push(
                    findReplacement(inferredArg, expectedArg, typedBlocks)
                );
            }

            return {
                ...inferredType,
                args: args,
            };
        }
        case "FunctionType": {
            return inferredType;
        }
        case "GenericType": {
            return expectedType;
        }
        case "ObjectLiteralType": {
            if (expectedType.kind !== "FixedType") return inferredType;
            let original = null;

            for (const block of typedBlocks) {
                if (block.type.name === expectedType.name) {
                    original = block;
                    break;
                }
            }
            if (original === null) return inferredType;

            switch (original.kind) {
                case "UnionUntaggedType": {
                    return inferredType;
                }
                case "UnionType": {
                    return inferredType;
                }
                case "TypeAlias": {
                    const seenNames: string[] = [];
                    for (const originalProperty of original.properties) {
                        seenNames.push(originalProperty.name);
                        const property =
                            inferredType.properties[originalProperty.name];

                        if (!property) return inferredType;

                        if (
                            !isSameType(originalProperty.type, property, false)
                        ) {
                            return inferredType;
                        }
                    }

                    for (const name of Object.keys(inferredType.properties)) {
                        if (seenNames.indexOf(name) === -1) {
                            return inferredType;
                        }
                    }

                    return expectedType;
                }
            }
        }
    }
}

/*
Takes an object literal which is used within a tag as the constructor
Takes the expected type of the constructor
Ensures that the expected type matches the object literal
*/
function validateConstructor(
    objectLiteral: ObjectLiteral,
    expectedType: Type,
    tag: Tag,
    unionType: UnionType,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues
): Result<string, null> {
    const typeAlias = objectLiteralTypeAlias(
        objectLiteral,
        expectedType,
        typedBlocks,
        imports,
        valuesInScope
    );
    const typeBlock = tagTypeAlias(tag, unionType, expectedType, typedBlocks);

    const missingPropertyFromTypeAlias: Property[] = [];
    const addedProperties: Property[] = [];
    const incorrectProperties: string[] = [];

    for (const property of typeAlias.properties) {
        let found = false;
        for (const typeProperty of typeBlock.properties) {
            if (property.name === typeProperty.name) {
                const maybeUntaggedUnionBlock = getUntaggedUnion(
                    typeProperty.type,
                    typedBlocks
                );

                if (maybeUntaggedUnionBlock.kind === "Ok") {
                    const fieldValue = objectLiteral.fields.filter(
                        (field) => field.name === property.name
                    )[0];

                    if (!fieldValue) continue;
                    if (fieldValue.value.kind !== "StringValue") continue;
                    const stringFieldValue = (fieldValue.value as StringValue)
                        .body;

                    const isCovered =
                        maybeUntaggedUnionBlock.value.values.filter(
                            (v) => v.body === stringFieldValue
                        ).length > 0;
                    if (!isCovered) {
                        incorrectProperties.push(
                            `${fieldValue.name}: Expected ${typeToString(
                                maybeUntaggedUnionBlock.value.type
                            )}, composed of ${maybeUntaggedUnionBlock.value.values
                                .map((v) => `"${v.body}"`)
                                .join(" | ")}\` but got "${stringFieldValue}"`
                        );
                    }
                } else if (
                    !isSameType(
                        findReplacement(
                            property.type,
                            typeProperty.type,
                            typedBlocks
                        ),
                        typeProperty.type,
                        false
                    ) ||
                    (property.type.kind === "ObjectLiteralType" &&
                        !isSameObjectLiteralTypeAlias(
                            property.type,
                            typeProperty.type,
                            typedBlocks
                        ))
                ) {
                    incorrectProperties.push(
                        `${property.name}: Expected ${typeToString(
                            typeProperty.type
                        )} but got ${typeToString(property.type)}`
                    );
                }

                found = true;
                break;
            }
        }
        if (!found) {
            addedProperties.push(property);
        }
    }
    for (const typeProperty of typeBlock.properties) {
        let found = false;
        for (const property of typeAlias.properties) {
            if (property.name === typeProperty.name) {
                found = true;
                break;
            }
        }
        if (!found) {
            missingPropertyFromTypeAlias.push(typeProperty);
        }
    }

    if (
        missingPropertyFromTypeAlias.length > 0 ||
        addedProperties.length > 0 ||
        incorrectProperties.length > 0
    ) {
        let errorMessage = "";
        if (missingPropertyFromTypeAlias.length > 0) {
            if (errorMessage.length > 0) errorMessage += "\n";
            errorMessage += `The tag ${
                tag.name
            } had these properties which are missing in this constructor object literal: ${missingPropertyFromTypeAlias
                .map((prop) => `${prop.name}: ${typeToString(prop.type)}`)
                .join(" | ")}`;
        }
        if (addedProperties.length > 0) {
            if (errorMessage.length > 0) errorMessage += "\n";
            errorMessage += `The constructor object literal had these properties which aren't in the tag ${
                tag.name
            }: ${addedProperties
                .map((prop) => `${prop.name}: ${typeToString(prop.type)}`)
                .join(" | ")}`;
        }
        if (incorrectProperties.length > 0) {
            if (errorMessage.length > 0) errorMessage += "\n";
            errorMessage += `Invalid properties: ${incorrectProperties.join(
                " | "
            )}`;
        }
        return Err(errorMessage);
    }

    return Ok(null);
}

function isImportedType(type_: Type, imports: Import[]): boolean {
    if (type_.kind !== "FixedType") return false;
    for (const import_ of imports) {
        for (const module of import_.modules) {
            for (const importedType of module.exposing) {
                if (type_.name === importedType) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isInTypeBlockType(type_: Type, typedBlocks: TypedBlock[]): boolean {
    if (type_.kind !== "FixedType") return false;

    for (const block of typedBlocks) {
        if (isSameType(block.type, type_, true)) {
            return true;
        }
    }

    return false;
}

function isImportedConstructor(
    constructor: Constructor,
    imports: Import[]
): boolean {
    for (const import_ of imports) {
        for (const module of import_.modules) {
            for (const importedName of module.exposing) {
                if (constructor.constructor === importedName) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function getValuesInTopLevelScope(blocks: Block[]): ScopedValues {
    const valuesInScope: ScopedValues = {};

    for (const block of blocks) {
        switch (block.kind) {
            case "Const": {
                valuesInScope[
                    block.name === "toString" ? `_${block.name}` : block.name
                ] = block.type;
                continue;
            }

            case "Function": {
                valuesInScope[
                    block.name === "toString" ? `_${block.name}` : block.name
                ] = block.returnType;
            }

            case "UnionType":
            case "UnionUntaggedType":
            case "TypeAlias": {
                continue;
            }

            case "MultilineComment":
            case "Comment":
            case "Export":
            case "Import": {
                continue;
            }
        }
    }

    return valuesInScope;
}

function isImportedTypeScriptType(
    type_: Type,
    typedBlocks: TypedBlock[],
    imports: Import[]
): boolean {
    return (
        isImportedType(type_, imports) && !isInTypeBlockType(type_, typedBlocks)
    );
}

function getValuesInBlockScope(
    block: Block,
    typedBlocks: TypedBlock[],
    imports: Import[]
): ScopedValues {
    const valuesInScope: ScopedValues = {};

    switch (block.kind) {
        case "Const": {
            for (const letBlock of block.letBody) {
                switch (letBlock.kind) {
                    case "Const": {
                        if (
                            isImportedTypeScriptType(
                                letBlock.type,
                                typedBlocks,
                                imports
                            )
                        ) {
                            break;
                        }
                        valuesInScope[
                            letBlock.name === "toString"
                                ? `_${letBlock.name}`
                                : letBlock.name
                        ] = letBlock.type;
                        break;
                    }
                    case "Function": {
                        if (
                            isImportedTypeScriptType(
                                letBlock.returnType,
                                typedBlocks,
                                imports
                            )
                        ) {
                            break;
                        }
                        valuesInScope[
                            letBlock.name === "toString"
                                ? `_${letBlock.name}`
                                : letBlock.name
                        ] = letBlock.returnType;
                        break;
                    }
                }
            }
            break;
        }

        case "Function": {
            for (const arg of block.args) {
                switch (arg.kind) {
                    case "AnonFunctionArg": {
                        break;
                    }
                    case "FunctionArg": {
                        if (
                            isImportedTypeScriptType(
                                arg.type,
                                typedBlocks,
                                imports
                            )
                        ) {
                            break;
                        }
                        valuesInScope[
                            arg.name === "toString" ? `_${arg.name}` : arg.name
                        ] = arg.type;
                        break;
                    }
                }
            }

            for (const letBlock of block.letBody) {
                switch (letBlock.kind) {
                    case "Const": {
                        if (
                            isImportedTypeScriptType(
                                letBlock.type,
                                typedBlocks,
                                imports
                            )
                        ) {
                            break;
                        }
                        valuesInScope[
                            letBlock.name === "toString"
                                ? `_${letBlock.name}`
                                : letBlock.name
                        ] = letBlock.type;
                        break;
                    }
                    case "Function": {
                        if (
                            isImportedTypeScriptType(
                                letBlock.returnType,
                                typedBlocks,
                                imports
                            )
                        ) {
                            break;
                        }
                        valuesInScope[
                            letBlock.name === "toString"
                                ? `_${letBlock.name}`
                                : letBlock.name
                        ] = letBlock.returnType;
                        break;
                    }
                }
            }
            break;
        }

        case "UnionType":
        case "UnionUntaggedType":
        case "TypeAlias": {
            break;
        }

        case "MultilineComment":
        case "Comment":
        case "Export":
        case "Import": {
            break;
        }
    }

    return valuesInScope;
}

function validateConst(
    block: Const,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInTopLevelScope: ScopedValues
): Result<string, Type> {
    if (!typeExistsInNamespace(block.type, typedBlocks, imports)) {
        return Err(
            `Type ${typeToString(block.type)} did not exist in the namespace`
        );
    }

    const valuesInScope = {
        ...valuesInTopLevelScope,
        ...getValuesInBlockScope(block, typedBlocks, imports),
    };

    const inferredRes = inferType(
        block.value,
        block.type,
        typedBlocks,
        imports,
        valuesInScope
    );

    if (inferredRes.kind === "Err") return inferredRes;
    const inferred = inferredRes.value;

    if (isSameType(block.type, inferred, false, typedBlocks)) {
        return Ok(block.type);
    }

    if (inferred.kind === "FixedType") {
        if (inferred.name === "string") {
            if (block.type.kind === "FixedType") {
                const matchingBlocks = typedBlocks.filter((b) =>
                    isSameType(b.type, block.type, false)
                );

                if (matchingBlocks.length > 0) {
                    const matchingBlock = matchingBlocks[0];
                    if (matchingBlock.kind === "UnionUntaggedType") {
                        const finalExpressions = allFinalExpressions(block);

                        for (const finalExpression of finalExpressions) {
                            const isCovered =
                                matchingBlock.values.filter(
                                    (v) => v.body === finalExpression
                                ).length > 0;
                            if (!isCovered) {
                                return Err(
                                    `Expected \`${typeToString(
                                        block.type
                                    )}, composed of ${matchingBlock.values
                                        .map((v) => `"${v.body}"`)
                                        .join(
                                            " | "
                                        )}\` but got \`${finalExpression}\` in the body of the const`
                                );
                            }
                        }

                        return Ok(block.type);
                    }
                }
            }
        } else if (inferred.args.length > 0) {
            if (inferred.args[0].kind === "ObjectLiteralType") {
                const maybeNestedType =
                    block.type.kind === "FixedType" &&
                    block.type.args.length > 0
                        ? block.type.args[0]
                        : block.type;

                const valid = validateObjectLiteralType(
                    inferred.args[0],
                    maybeNestedType,
                    typedBlocks,
                    imports
                );

                if (valid.kind === "Err") {
                    return Err(
                        `Expected ${typeToString(block.type)} but ${valid.error
                            .slice(0, 1)
                            .toLowerCase()}${valid.error.slice(1)}`
                    );
                }
                return Ok(block.type);
            }
        }
    } else if (inferred.kind === "ObjectLiteralType") {
        if (isImportedType(block.type, imports)) {
            return Ok(block.type);
        }

        const maybeNestedType =
            block.type.kind === "FixedType" && block.type.name === "List"
                ? block.type.args[0]
                : block.type;
        const validation = validateObjectLiteral(
            block.value as ObjectLiteral,
            maybeNestedType,
            typedBlocks,
            imports,
            valuesInScope
        );
        if (validation.kind === "Err") {
            return validation;
        }
    }

    const replacement = findReplacement(
        inferredRes.value,
        block.type,
        typedBlocks
    );

    if (isSameType(replacement, block.type, false)) {
        return Ok(replacement);
    }

    return Err(
        `Expected \`${typeToString(block.type)}\` but got \`${typeToString(
            inferred
        )}\``
    );
}

function validateFunction(
    block: Function,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInTopLevelScope: ScopedValues
): Result<string, Type> {
    const notExistingErrors = [];

    if (!typeExistsInNamespace(block.returnType, typedBlocks, imports)) {
        notExistingErrors.push(
            `Type ${typeToString(
                block.returnType
            )} did not exist in the namespace`
        );
    }

    for (const arg of block.args) {
        if (!typeExistsInNamespace(arg.type, typedBlocks, imports)) {
            notExistingErrors.push(
                `Type ${typeToString(arg.type)} did not exist in the namespace`
            );
        }
    }

    if (notExistingErrors.length > 0) {
        return Err(notExistingErrors.join("\n"));
    }

    const valuesInScope = {
        ...valuesInTopLevelScope,
        ...getValuesInBlockScope(block, typedBlocks, imports),
    };

    const inferredRes = inferType(
        block.body,
        block.returnType,
        typedBlocks,
        imports,
        valuesInScope
    );
    if (inferredRes.kind === "Err") return inferredRes;
    const inferred = inferredRes.value;

    if (inferred.kind === "FixedType" && inferred.name === "string") {
        if (block.returnType.kind === "FixedType") {
            const matchingBlocks = typedBlocks.filter((b) =>
                isSameType(b.type, block.returnType, false)
            );

            if (matchingBlocks.length > 0) {
                const matchingBlock = matchingBlocks[0];
                if (matchingBlock.kind === "UnionUntaggedType") {
                    const finalExpressions = allFinalExpressions(block);

                    for (const finalExpression of finalExpressions) {
                        const isCovered =
                            matchingBlock.values.filter(
                                (v) => v.body === finalExpression
                            ).length > 0;
                        if (!isCovered) {
                            return Err(
                                `Expected \`${typeToString(
                                    block.returnType
                                )}, composed of ${matchingBlock.values
                                    .map((v) => `"${v.body}"`)
                                    .join(
                                        " | "
                                    )}\` but got \`${finalExpression}\` in the body of the function`
                            );
                        }
                    }

                    return Ok(block.returnType);
                }
            }
        }
    } else if (inferred.kind === "ObjectLiteralType") {
        if (isImportedType(block.returnType, imports)) {
            return Ok(block.returnType);
        }

        if (block.body.kind === "ObjectLiteral") {
            const maybeNestedType =
                block.returnType.kind === "FixedType" &&
                block.returnType.name === "List"
                    ? block.returnType.args[0]
                    : block.returnType;

            const validation = validateObjectLiteral(
                block.body,
                maybeNestedType,
                typedBlocks,
                imports,
                valuesInScope
            );
            if (validation.kind === "Err") {
                return validation;
            }
            return Ok(block.returnType);
        }
    }

    const replacement = findReplacement(
        inferredRes.value,
        block.returnType,
        typedBlocks
    );

    if (
        !isSameType(replacement, block.returnType, false, typedBlocks) &&
        !isSameType(block.returnType, inferred, false, typedBlocks)
    ) {
        return Err(
            `Expected \`${typeToString(
                block.returnType
            )}\` but got \`${typeToString(
                inferred
            )}\` in the body of the function`
        );
    }

    return Ok(block.returnType);
}

export function validateType(
    block: Block,
    typedBlocks: TypedBlock[],
    imports: Import[],
    valuesInScope: ScopedValues = {}
): Result<string, Type> {
    switch (block.kind) {
        case "Const": {
            return validateConst(block, typedBlocks, imports, valuesInScope);
        }

        case "Function": {
            return validateFunction(block, typedBlocks, imports, valuesInScope);
        }

        case "UnionType":
        case "UnionUntaggedType":
        case "TypeAlias": {
            return Ok(block.type);
        }

        case "MultilineComment":
        case "Comment":
        case "Export":
        case "Import":
        case "Typeclass":
        case "Impl": {
            return Ok(FixedType("any", []));
        }
    }
}
