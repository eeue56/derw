import { exportTests } from "../Blocks";

import { hashCode } from "../Utils";

import { isBuiltinType } from "../builtins";

import * as List from "../stdlib/List";

import * as Aliases from "../types";
import { TypeAlias, Property } from "../types";

import * as Blocks from "../types";
import { Function, FunctionArg, FunctionArgsUnion, Const, ImportModule, Import, Export, Module } from "../types";

import * as Boolean from "../types";
import { Equality, InEquality, LessThan, LessThanOrEqual, GreaterThan, GreaterThanOrEqual, And, Or, ListPrepend } from "../types";

import * as Control from "../types";
import { IfStatement, ElseIfStatement, Destructure, ListDestructure, ListDestructurePart, BranchPattern, Branch, CaseStatement, DoBlock, DoExpression } from "../types";

import * as Functions from "../types";
import { FunctionCall, Lambda, LambdaCall } from "../types";

import * as Objects from "../types";
import { ObjectLiteral, Field, ModuleReference } from "../types";

import * as Operators from "../types";
import { Addition, Subtraction, Multiplication, Division, Mod, LeftPipe, RightPipe } from "../types";

import * as Values from "../types";
import { Value, StringValue, FormatStringValue, ListValue, ListRange } from "../types";

import { Tag, UnionType, UnionUntaggedType, Type, TagArg, Block, Constructor, Expression, FunctionType, GenericType, FixedType, isSimpleValue } from "../types";

import { prefixLines, destructureLength, patternHasGaps, patternGapPositions } from "./Common";

import { flattenLeftPipe, generateExportBlock, generateFormatStringValue, generateImportBlock, generateListDestructurePart, generateListRange, generateStringValue, generateValue } from "./CommonToEcma";

export { generateTypescript };

function generateTypeArg(arg: TagArg, imports: Import[]): string {
    return `${arg.name}: ${generateType(arg.type, imports)};`;
}

function generateTagCreator(tag: Tag, imports: Import[]): string {
    const typeDefArgs: string = (function(y: any) {
        return y.join("\n    ");
    })(List.map(function(arg: any) {
        return generateTypeArg(arg, imports);
    }, tag.args));
    const funcDefArgs: string = (function(y: any) {
        return y.join(", ");
    })(List.map(function(arg: any) {
        return `${arg.name}: ${generateType(arg.type, imports)}`;
    }, tag.args));
    function filterTypes(arg: Type): boolean {
        const isBuiltin: boolean = (function (): any {
            switch (arg.kind) {
                case "FixedType": {
                    const { name } = arg;
                    return isBuiltinType(name);
                }
                case "GenericType": {
                    const { name } = arg;
                    return isBuiltinType(name);
                }
                case "FunctionType": {
                    return false;
                }
            }
        })();
        if (isBuiltin) {
            return false;
        } else {
            return true;
        }
    }
    const newArgs: Type[] = List.filter(filterTypes, List.map(function(arg: any) {
        return arg.type;
    }, tag.args));
    const tagType: string = (function(y: any) {
        return generateType(y, imports);
    })({
        kind: "FixedType",
        name: tag.name,
        args: newArgs
    });
    const funcDefArgsStr: string = tag.args.length === 0 ? "{}" : `{ ${funcDefArgs} }`;
    const typeDefStr: string = typeDefArgs === "" ? "" : "\n    " + typeDefArgs;
    return (function(y: any) {
        return y.join("\n");
    })([ `type ${tagType} = {`, `    kind: "${tag.name}";${typeDefStr}`, "};", "", `function ${tagType}(args: ${funcDefArgsStr}): ${tagType} {`, "    return {", `        kind: "${tag.name}",`, `        ...args,`, `    };`, "}" ]);
}

function generateTag(tag: Tag, imports: Import[]): string {
    function filterTypes(arg: Type): boolean {
        const isBuiltin: boolean = (function (): any {
            switch (arg.kind) {
                case "FixedType": {
                    const { name } = arg;
                    return isBuiltinType(name);
                }
                case "GenericType": {
                    const { name } = arg;
                    return isBuiltinType(name);
                }
                case "FunctionType": {
                    return false;
                }
            }
        })();
        if (isBuiltin) {
            return false;
        } else {
            return true;
        }
    }
    const newArgs: Type[] = List.filter(filterTypes, List.map(function(arg: any) {
        return arg.type;
    }, tag.args));
    const tagType: string = (function(y: any) {
        return generateType(y, imports);
    })({
        kind: "FixedType",
        name: tag.name,
        args: newArgs
    });
    return tagType;
}

function generateUnionType(syntax: UnionType, imports: Import[]): string {
    const tagCreators: string = (function(y: any) {
        return y.join("\n\n");
    })(List.map(function(tag: any) {
        return generateTagCreator(tag, imports);
    }, syntax.tags));
    const tags: string = (function(y: any) {
        return y.join(" | ");
    })(List.map(function(tag: any) {
        return generateTag(tag, imports);
    }, syntax.tags));
    return (function(y: any) {
        return y.join("\n");
    })([ tagCreators, "", `type ${generateType(syntax.type, imports)} = ${tags};` ]);
}

function generateUnionUntaggedType(syntax: UnionUntaggedType): string {
    const values: string = (function(y: any) {
        return y.join(" | ");
    })(List.map(function(y: any) {
        return `"${y.body}"`;
    }, syntax.values));
    return `type ${generateType(syntax.type, [])} = ${values};`;
}

function generateProperty(syntax: Property, imports: Import[]): string {
    return `${syntax.name}: ${generateTopLevelType(syntax.type, imports)}`;
}

function generateTypeAlias(syntax: TypeAlias, imports: Import[]): string {
    const generatedProperties: string[] = List.map(function(prop: any) {
        return generateProperty(prop, imports);
    }, syntax.properties);
    const properties: string = generatedProperties.length === 0 ? "" : `    ${generatedProperties.join(";\n    ")};`;
    const typeDef: string = generateType(syntax.type, imports);
    const args: string = generatedProperties.length === 0 ? " " : ` ${generatedProperties.join(", ")} `;
    return (function(y: any) {
        return y.join("\n");
    })([ `type ${typeDef} = {`, properties, "}", "", `function ${typeDef}(args: {${args}}): ${typeDef} {`, "    return {", "        ...args,", "    };", "}" ]);
}

function generateListType(args: Type[], imports: Import[]): string {
    if (args.length > 0 && args[0].kind === "GenericType") {
        return `${generateType(args[0], imports)}[]`;
    } else {
        const fixedArgs: Type[] = List.filter(function(type_: any) {
            return type_.kind === "FixedType";
        }, args);
        const generatedArgs: string[] = List.map(function(arg: any) {
            return generateType(arg, imports);
        }, fixedArgs);
        switch (fixedArgs.length) {
            case 0: {
                return "any[]";
            }
            case fixedArgs.length: {
                if (fixedArgs.length === 1) {
                    const [ x ] = fixedArgs;
                    return `${generateType(x, imports)}[]`;
                }
            }
            default: {
                return `(${generatedArgs.join(" | ")})[]`;
            }
        };
    }
}

function generateListTopLevelType(args: Type[], imports: Import[]): string {
    if (args.length > 0 && args[0].kind === "GenericType") {
        return `${generateTopLevelType(args[0], imports)}[]`;
    } else {
        const fixedArgs: Type[] = List.filter(function(type_: any) {
            return type_.kind === "FixedType";
        }, args);
        const generatedArgs: string[] = List.map(function(arg: any) {
            return generateTopLevelType(arg, imports);
        }, fixedArgs);
        switch (fixedArgs.length) {
            case 0: {
                return "any[]";
            }
            case fixedArgs.length: {
                if (fixedArgs.length === 1) {
                    const [ x ] = fixedArgs;
                    return `${generateTopLevelType(x, imports)}[]`;
                }
            }
            default: {
                return `(${generatedArgs.join(" | ")})[]`;
            }
        };
    }
}

function getGenericTypesFromFunctionType(type_: FunctionType): GenericType[] {
    return List.filter(function(arg: any) {
        return arg.kind === "GenericType";
    }, type_.args);
}

function modulesHasOverlap(type_: FixedType, modules: ImportModule[]): boolean {
    switch (modules.length) {
        case 0: {
            return false;
        }
        case modules.length: {
            if (modules.length >= 1) {
                const [ module_, ...xs ] = modules;
                switch (module_.alias.kind) {
                case "Just": {
                    const { value } = module_.alias;
                    if (value === type_.name) {
                        return true;
                    } else {
                        return modulesHasOverlap(type_, xs);
                    };
                }
                case "Nothing": {
                    return modulesHasOverlap(type_, xs);
                }
            };
            }
        }
        default: {
            return false;
        }
    }
}

function typeHasOverlapWithImportedModule(type_: FixedType, imports: Import[]): boolean {
    switch (imports.length) {
        case 0: {
            return false;
        }
        case imports.length: {
            if (imports.length >= 1) {
                const [ import_, ...xs ] = imports;
                if (modulesHasOverlap(type_, import_.modules)) {
                return true;
            } else {
                return typeHasOverlapWithImportedModule(type_, xs);
            };
            }
        }
        default: {
            return false;
        }
    }
}

function generateTopLevelType(type_: Type, imports: Import[]): string {
    switch (type_.kind) {
        case "GenericType": {
            return generateType(type_, imports);
        }
        case "FixedType": {
            const { name, args } = type_;
            if (name === "List") {
                return generateListTopLevelType(args, imports);
            } else {
                if (args.length > 0 && args[0].kind === "FixedType" && args[0].args.length > 0) {
                    const generatedArgs: string[] = List.map(function(arg: any) {
                        return generateTopLevelType(arg, imports);
                    }, args);
                    return `${name}<${generatedArgs.join(", ")}>`;
                } else {
                    function getGenericArgs(type_: Type): Type[] {
                        switch (type_.kind) {
                            case "GenericType": {
                                return [ type_ ];
                            }
                            case "FunctionType": {
                                return getGenericTypesFromFunctionType(type_);
                            }
                            case "FixedType": {
                                return [ type_ ];
                            }
                            case "ObjectLiteralType": {
                                return [ ];
                            }
                        }
                    }
                    const genericArgs: Type[] = List.foldl(function(arg: any, xs: any) {
                        return List.append(xs, getGenericArgs(arg));
                    }, [ ], args);
                    const generatedGenericArgs: string[] = List.map(function(arg: any) {
                        return generateType(arg, imports);
                    }, genericArgs);
                    const qualifiedName: string = typeHasOverlapWithImportedModule(type_, imports) ? `${type_.name}.${type_.name}` : type_.name;
                    if (genericArgs.length === 0) {
                        return qualifiedName;
                    } else {
                        return `${qualifiedName}<${generatedGenericArgs.join(", ")}>`;
                    };
                };
            };
        }
        case "FunctionType": {
            const { args } = type_;
            const typeToReturn: string = generateType(args[args.length - 1], imports);
            const parts: string[] = List.indexedMap(function(arg: any, index: any) {
                return `arg${index}: ${generateTopLevelType(arg, imports)}`;
            }, args.slice(0, -1));
            return `(${parts.join(", ")}) => ${typeToReturn}`;
        }
        case "ObjectLiteralType": {
            return ``;
        }
    }
}

function getGenericTypes(type_: Type): GenericType[] {
    switch (type_.kind) {
        case "GenericType": {
            return [ type_ ];
        }
        case "FunctionType": {
            return getGenericTypesFromFunctionType(type_);
        }
        case "FixedType": {
            const { args } = type_;
            return List.foldl(function(newType: any, collection: any) {
            return List.append(collection, getGenericTypes(newType));
        }, [ ], args);
        }
        case "ObjectLiteralType": {
            return [ ];
        }
    }
}

function removeDuplicateTypes(xs: GenericType[]): GenericType[] {
    switch (xs.length) {
        case 0: {
            return [ ];
        }
        case xs.length: {
            if (xs.length >= 1) {
                const [ x, ...rest ] = xs;
                const restNames: string[] = List.map(function(y: any) {
                    return y.name;
                }, rest);
                if (restNames.includes(x.name)) {
                return removeDuplicateTypes(rest);
            } else {
                return [ x, ...removeDuplicateTypes(rest) ];
            };
            }
        }
        default: {
            return [ ];
        }
    }
}

function generateType(type_: Type, imports: Import[]): string {
    switch (type_.kind) {
        case "GenericType": {
            const { name } = type_;
            return name;
        }
        case "FixedType": {
            const { name, args } = type_;
            if (name === "List") {
                return generateListType(args, imports);
            } else {
                const genericArgs: Type[] = removeDuplicateTypes(List.foldl(function(arg: any, xs: any) {
                    return List.append(xs, getGenericTypes(arg));
                }, [ ], args));
                const generatedGenericArgs: string[] = List.map(function(arg: any) {
                    return generateType(arg, imports);
                }, genericArgs);
                const qualifiedName: string = typeHasOverlapWithImportedModule(type_, imports) ? `${type_.name}.${type_.name}` : type_.name;
                if (genericArgs.length === 0) {
                    return qualifiedName;
                } else {
                    return `${qualifiedName}<${generatedGenericArgs.join(", ")}>`;
                };
            };
        }
        case "FunctionType": {
            const { args } = type_;
            const typeToReturn: string = generateType(args[args.length - 1], imports);
            const parts: string[] = List.indexedMap(function(arg: any, index: any) {
                return `arg${index}: ${generateType(arg, imports)}`;
            }, args.slice(0, -1));
            return `(${parts.join(", ")}) => ${typeToReturn}`;
        }
        case "ObjectLiteralType": {
            return ``;
        }
    }
}

function generateField(field: Field): string {
    const value: string = generateExpression(field.value);
    if (field.name === value) {
        return field.name;
    } else {
        return `${field.name}: ${value}`;
    }
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    const fields: string = (function(y: any) {
        return y.join(",\n    ");
    })(literal.fields.map(generateField));
    if (literal.base === null) {
        switch (literal.fields.length) {
            case 0: {
                return "{ }";
            }
            case literal.fields.length: {
                if (literal.fields.length === 1) {
                    const [ x ] = literal.fields;
                    return `{ ${fields} }`;
                }
            }
            default: {
                return `{\n    ${fields}\n}`;
            }
        };
    } else {
        switch (literal.fields.length) {
            case 0: {
                return `{ ${literal.base.body} }`;
            }
            case literal.fields.length: {
                if (literal.fields.length === 1) {
                    const [ x ] = literal.fields;
                    return `{ ${literal.base.body}, ${fields} }`;
                }
            }
            default: {
                return `{\n    ${literal.base.body},\n    ${fields}\n}`;
            }
        };
    }
}

function generateListValue(list: ListValue): string {
    function generator(expression: Expression): string {
        switch (expression.kind) {
            case "IfStatement": {
                return generateInlineIf(expression);
            }
            case "CaseStatement": {
                return generateInlineCase(expression);
            }
            default: {
                return generateExpression(expression);
            }
        }
    }
    const items: string[] = List.map(generator, list.items);
    switch (items.length) {
        case 0: {
            return "[ ]";
        }
        case items.length: {
            if (items.length === 1) {
                const [ x ] = items;
                return `[ ${x} ]`;
            }
        }
        default: {
            return `[ ${items.join(", ")} ]`;
        }
    }
}

function generateLetBlock(body: Block[], parentTypeArguments: string[], imports: Import[]): string {
    switch (body.length) {
        case 0: {
            return "";
        }
        case body.length: {
            if (body.length >= 1) {
                const [ x, ...ys ] = body;
                const prefixedBody: string = (function(y: any) {
                    return y.join("\n");
                })(List.map(function(block: any) {
                    return generateBlock(block, parentTypeArguments, [ ], imports);
                }, body));
                const prefixedLines: string = prefixLines(prefixedBody, 4);
                return `\n${prefixedLines}`;
            }
        }
        default: {
            return "";
        }
    }
}

function generateElseIfStatement(elseIfStatement: ElseIfStatement, parentTypeArguments: string[]): string {
    const isSimpleBody: boolean = isSimpleValue(elseIfStatement.body.kind);
    const bodyPrefix: string = isSimpleBody ? "return " : "";
    const predicate: string = generateExpression(elseIfStatement.predicate);
    const body: string = (function(y: any) {
        return prefixLines(y, 4);
    })((function(y: any) {
        return bodyPrefix + y;
    })(generateExpression(elseIfStatement.body, parentTypeArguments)));
    const bodySuffix: string = isSimpleBody ? ";" : "";
    return `} else if (${predicate}) {\n${body}${bodySuffix}`;
}

function generateIfStatement(ifStatement: IfStatement, parentTypeArguments: string[], isAsync: boolean, neverSimple: boolean): string {
    const isSimpleIfBody: boolean = neverSimple ? false : isSimpleValue(ifStatement.ifBody.kind);
    const isSimpleElseBody: boolean = neverSimple ? false : isSimpleValue(ifStatement.elseBody.kind);
    const ifBodyPrefix: string = isSimpleIfBody ? "return " : "";
    const asyncPrefix: string = isAsync ? "await " : "";
    const elseBodyPrefix: string = isSimpleElseBody ? "return " : "";
    const maybeIfLetBody: string = generateLetBlock(ifStatement.ifLetBody, parentTypeArguments, [ ]);
    const maybeElseLetBody: string = generateLetBlock(ifStatement.elseLetBody, parentTypeArguments, [ ]);
    const predicate: string = generateExpression(ifStatement.predicate);
    const ifBody: string = generateExpression(ifStatement.ifBody, parentTypeArguments);
    const indentedIfBody: string = (function (): any {
        const _res1668698078 = ifBody.split("\n");
        switch (_res1668698078.length) {
            case 0: {
                return ifBody;
            }
            case _res1668698078.length: {
                if (_res1668698078.length === 1) {
                    const [ x ] = _res1668698078;
                    return ifBody;
                }
            }
            case _res1668698078.length: {
                if (_res1668698078.length >= 1) {
                    const [ x, ...xs ] = _res1668698078;
                    return (function(y: any) {
                return y.join("\n");
            })([ x, prefixLines(xs.join("\n"), 4) ]);
                }
            }
            default: {
                return ifBody;
            }
        }
    })();
    const elseBody: string = generateExpression(ifStatement.elseBody, parentTypeArguments);
    const indentedElseBody: string = (function (): any {
        const _res415623174 = elseBody.split("\n");
        switch (_res415623174.length) {
            case 0: {
                return elseBody;
            }
            case _res415623174.length: {
                if (_res415623174.length === 1) {
                    const [ x ] = _res415623174;
                    return elseBody;
                }
            }
            case _res415623174.length: {
                if (_res415623174.length >= 1) {
                    const [ x, ...xs ] = _res415623174;
                    return (function(y: any) {
                return y.join("\n");
            })([ x, prefixLines(xs.join("\n"), 4) ]);
                }
            }
            default: {
                return elseBody;
            }
        }
    })();
    const elseIfs: string = (function(y: any) {
        return y.join("\n");
    })(List.map(function(elseIf: any) {
        return generateElseIfStatement(elseIf, parentTypeArguments);
    }, ifStatement.elseIf));
    const prefixedElseIfs: string = elseIfs === "" ? "}" : `${elseIfs}\n}`;
    return `if (${predicate}) {${maybeIfLetBody}\n    ${ifBodyPrefix}${asyncPrefix}${indentedIfBody};\n${prefixedElseIfs} else {${maybeElseLetBody}\n    ${elseBodyPrefix}${asyncPrefix}${indentedElseBody};\n}`;
}

function generateConstructor(constructor: Constructor): string {
    switch (constructor.pattern.fields.length) {
        case 0: {
            return `${constructor.constructor}({ })`;
        }
        default: {
            return `${constructor.constructor}(${generateObjectLiteral(constructor.pattern)})`;
        }
    }
}

const replaceKey: string = "$REPLACE_ME";

type GapsInfo = {
    partIndex: number;
    currentIndex: number;
    output: string;
}

function GapsInfo(args: { partIndex: number, currentIndex: number, output: string }): GapsInfo {
    return {
        ...args,
    };
}

function generateListDestructurePartWithGaps(predicate: string, parts: ListDestructurePart[], part: ListDestructurePart, info: GapsInfo): GapsInfo {
    if (info.partIndex < info.currentIndex) {
        return { ...info, partIndex: info.partIndex + 1 };
    } else {
        const index: number = info.currentIndex;
        const output: string = info.output;
        const isLastValue: boolean = index === parts.length - 1;
        switch (part.kind) {
            case "Destructure": {
                const isNextAValue: boolean = isLastValue ? false : parts[index + 1].kind === "Value";
                const hasADestructureAfter: boolean = index < parts.length - 2 ? parts[index + 2].kind === "Destructure" : false;
                if (isNextAValue && hasADestructureAfter) {
                    const nextValue: Value = (function(y: any) {
                        return y;
                    })(parts[index + 1]);
                    const destructorAfter: Destructure = (function(y: any) {
                        return y;
                    })(parts[index + 2]);
                    return (function(y: any) {
                        return {
                        ...info,
                        output: y,
                        partIndex: info.partIndex + 1,
                        currentIndex: info.currentIndex + 2
                    };
                    })((function(y: any) {
                        return prefixLines(y, 8);
                    })((function(y: any) {
                        return y.join("\n");
                    })([ `const [ _0, ..._rest ] = ${predicate};`, `if (_0.kind === "${part.constructor}") {`, `    let _foundIndex: number = -1;`, `    for (let _i = 0; _i < _rest.length; _i++) {`, `        if (_rest[_i].kind === "${destructorAfter.constructor}") {`, `            _foundIndex = _i;`, `            break;`, `        }`, `    }`, ``, `    if (_foundIndex > -1) {`, `        const ${nextValue.body} = _rest.slice(0, _foundIndex);`, `        ${replaceKey}`, `    }`, `}` ])));
                } else {
                    return { ...info, partIndex: info.partIndex + 1 };
                };
            }
            case "Value": {
                const newOutput: string = output.length === 0 ? `\nconst ${part.body} = _rest;\n                    ` : ( parts[info.partIndex - 1].kind === "Destructure" ? output.replace(replaceKey, `const ${part.body} = _rest.slice(_foundIndex, _rest.length);\n${replaceKey}`) : output.replace(replaceKey, `const ${part.body} = _rest;\n${replaceKey}`) );
                return {
                ...info,
                output: newOutput,
                partIndex: info.partIndex + 1,
                currentIndex: info.currentIndex + 1
            };
            }
            default: {
                return {
                ...info,
                currentIndex: info.currentIndex + 1,
                partIndex: info.partIndex + 1
            };
            }
        };
    }
}

function generateListDestructureWithGaps(predicate: string, branch: Branch, pattern: ListDestructure): string {
    const isFinalEmptyList: boolean = pattern.parts[pattern.parts.length - 1].kind === "EmptyList";
    const partsWithLength: number = destructureLength(pattern);
    const startingInfo: GapsInfo = {
        output: "",
        partIndex: 0,
        currentIndex: 0
    };
    const parts: string = (function(y: any) {
        return y.output;
    })(List.foldl(function(x: any, info: any) {
        return generateListDestructurePartWithGaps(predicate, pattern.parts, x, info);
    }, startingInfo, pattern.parts));
    const conditional: string = isFinalEmptyList ? `${predicate}.length === ${partsWithLength}` : `${predicate}.length >= ${partsWithLength}`;
    const isSimpleBody: boolean = isSimpleValue(branch.body.kind);
    const wrapper: string = isSimpleBody ? `    return ` : "";
    const bodyIndent: number = isSimpleBody ? 0 : 4;
    const body: string = (function(y: any) {
        return prefixLines(y, bodyIndent);
    })(generateExpression(branch.body));
    const inner: string = prefixLines(`${wrapper}${body};`, 12);
    return `case ${predicate}.length: {\n    if (${conditional}) {\n${parts.replace(replaceKey, inner)}\n    }\n}`;
}

function generateBranch(predicate: string, branch: Branch, parentTypeArguments: string[]): string {
    const isSimpleBody: boolean = isSimpleValue(branch.body.kind);
    const wrapper: string = isSimpleBody ? "    return " : "";
    const maybeLetBody: string = generateLetBlock(branch.letBody, parentTypeArguments, [ ]);
    const bodyIndent: number = isSimpleBody ? 0 : 4;
    const branchBody: string = (function(y: any) {
        return prefixLines(y, bodyIndent);
    })(generateExpression(branch.body, parentTypeArguments));
    switch (branch.pattern.kind) {
        case "Destructure": {
            const { pattern } = branch.pattern;
            const generatedPattern: string = pattern.trim().length > 0 ? `\n    const ${pattern} = ${predicate};` : "";
            return `case "${branch.pattern.constructor}": {${generatedPattern}${maybeLetBody}\n${wrapper}${branchBody};\n}`;
        }
        case "StringValue": {
            const { body } = branch.pattern;
            return `case "${body}": {${maybeLetBody}\n${wrapper}${branchBody};\n}`;
        }
        case "FormatStringValue": {
            const { body } = branch.pattern;
            return `case ` + "`" + body + "`" + `: {${maybeLetBody}\n${wrapper}${branchBody};\n}`;
        }
        case "EmptyList": {
            return `case 0: {${maybeLetBody}\n${wrapper}${branchBody};\n}`;
        }
        case "ListDestructure": {
            const { parts } = branch.pattern;
            const length: number = parts.length;
            const isFinalEmptyList: boolean = parts[length - 1].kind === "EmptyList";
            const partsWithLength: number = destructureLength(branch.pattern);
            const hasGaps: boolean = patternHasGaps(branch.pattern);
            const gapPositions: number[] = patternGapPositions(branch.pattern);
            const isOnlyFinalGap: boolean = gapPositions.length === 1 && gapPositions[0] === length - 1;
            function not(value: boolean): boolean {
                if (value) {
                    return false;
                } else {
                    return true;
                }
            }
            const conditional: string = isFinalEmptyList && not(hasGaps) ? `${predicate}.length === ${partsWithLength}` : `${predicate}.length >= ${partsWithLength}`;
            const firstPart: ListDestructurePart = parts[0];
            const isFirstDestructure: boolean = firstPart.kind === "Destructure";
            if (hasGaps && not(isOnlyFinalGap)) {
                return generateListDestructureWithGaps(predicate, branch, branch.pattern);
            } else {
                if (isFirstDestructure) {
                    const destructors: Destructure[] = List.filter(function(t: any) {
                        return t.kind === "Destructure";
                    }, parts);
                    const destructorParts: string[] = List.indexedMap(function(_: any, i: any) {
                        return `_${i}`;
                    }, destructors);
                    const allButFinalPart: string[] = List.map(generateListDestructurePart, parts.slice(destructorParts.length, -1));
                    const generatedParts: string[] = List.append(destructorParts, allButFinalPart);
                    const joinedGeneratedParts: string = generatedParts.join(", ");
                    const partsString: string = isFinalEmptyList ? joinedGeneratedParts : `${joinedGeneratedParts}, ...${generateListDestructurePart(parts[length - 1])}`;
                    const conditionals: string[] = List.indexedMap(function(destructor: any, index: any) {
                        return `_${index}.kind === "${destructor.constructor}"`;
                    }, destructors);
                    const joinedConditionals: string = conditionals.join(" && ");
                    function unpackFn(destructor: Destructure, index: number): string {
                        if (destructor.pattern.length === 0) {
                            return "";
                        } else {
                            return `\n            const ${destructor.pattern} = _${index};`;
                        }
                    }
                    const unpacked: string[] = List.indexedMap(unpackFn, destructors);
                    const joinedUnpacked: string = unpacked.length === 0 ? "" : unpacked.join("");
                    return (function(y: any) {
                        return y.join("\n");
                    })([ `case ${predicate}.length: {`, `    if (${conditional}) {`, `        const [ ${partsString} ] = ${predicate};`, `        if (${joinedConditionals}) {${joinedUnpacked}${maybeLetBody ? prefixLines(maybeLetBody, 8) : ""}`, `        ${wrapper}${branchBody};`, `        }`, `    }`, `}` ]);
                } else {
                    const isFirstValue: boolean = firstPart.kind === "StringValue" || firstPart.kind === "FormatStringValue";
                    const partsToGenerate: ListDestructurePart[] = isFirstValue ? [ {
                        kind: "Value",
                        body: "_temp"
                    }, ...branch.pattern.parts.slice(1, -1) ] : branch.pattern.parts.slice(0, -1);
                    const generatedParts: string[] = List.map(generateListDestructurePart, partsToGenerate);
                    const joinedParts: string = generatedParts.join(", ");
                    const partsString: string = isFinalEmptyList ? joinedParts : `${joinedParts}, ...${generateListDestructurePart(branch.pattern.parts[length - 1])}`;
                    if (isFirstValue) {
                        const tempConditional: string = (function (): any {
                            switch (firstPart.kind) {
                                case "StringValue": {
                                    const { body } = firstPart;
                                    return `"${body}"`;
                                }
                                case "FormatStringValue": {
                                    const { body } = firstPart;
                                    return "`" + body + "`";
                                }
                                default: {
                                    return "";
                                }
                            }
                        })();
                        return (function(y: any) {
                            return y.join("\n");
                        })([ `case ${predicate}.length: {`, `    if (${conditional}) {`, `        const [ ${partsString} ] = ${predicate};${maybeLetBody ? prefixLines(maybeLetBody, 4) : ""}`, `        if (_temp === ${tempConditional}) {`, `        ${wrapper}${branchBody};`, `        }`, `    }`, `}` ]);
                    } else {
                        return (function(y: any) {
                            return y.join("\n");
                        })([ `case ${predicate}.length: {`, `    if (${conditional}) {`, `        const [ ${partsString} ] = ${predicate};${maybeLetBody ? prefixLines(maybeLetBody, 4) : ""}`, `    ${wrapper}${branchBody};`, `    }`, `}` ]);
                    };
                };
            };
        }
        case "Default": {
            return `default: {${maybeLetBody}\n${wrapper}${branchBody};\n}`;
        }
    }
}

function isModuleReferenceToAValue(moduleReference: ModuleReference): boolean {
    return moduleReference.value.kind === "Value";
}

function generateCaseStatement(caseStatement: CaseStatement, parentTypeArguments: string[]): string {
    const predicate: string = generateExpression(caseStatement.predicate);
    const isValue: boolean = (function (): any {
        switch (caseStatement.predicate.kind) {
            case "Value": {
                return true;
            }
            case "ModuleReference": {
                return isModuleReferenceToAValue(caseStatement.predicate);
            }
            default: {
                return false;
            }
        }
    })();
    const name: string = isValue ? predicate : `_res${hashCode(predicate)}`;
    const maybePredicateAssignment: string = isValue ? "" : `const ${name} = ${predicate};\n`;
    const branches: string = (function(y: any) {
        return prefixLines(y, 4);
    })((function(y: any) {
        return y.join("\n");
    })(List.map(function(branch: any) {
        return generateBranch(name, branch, parentTypeArguments);
    }, caseStatement.branches)));
    const isString: boolean = (function(y: any) {
        return y.length > 0;
    })(List.filter(function(branch: any) {
        return branch.pattern.kind === "StringValue";
    }, caseStatement.branches));
    const isList: boolean = (function(y: any) {
        return y.length > 0;
    })(List.filter(function(branch: any) {
        return branch.pattern.kind === "EmptyList" || branch.pattern.kind === "ListDestructure";
    }, caseStatement.branches));
    if (isString) {
        return `${maybePredicateAssignment}switch (${name}) {\n${branches}\n}`;
    } else {
        if (isList) {
            return `${maybePredicateAssignment}switch (${name}.length) {\n${branches}\n}`;
        } else {
            return `${maybePredicateAssignment}switch (${name}.kind) {\n${branches}\n}`;
        };
    }
}

function generateAddition(addition: Addition): string {
    const left: string = generateExpression(addition.left);
    const right: string = generateExpression(addition.right);
    return `${left} + ${right}`;
}

function generateSubtraction(subtraction: Subtraction): string {
    const left: string = generateExpression(subtraction.left);
    const right: string = generateExpression(subtraction.right);
    return `${left} - ${right}`;
}

function generateMultiplication(multiplication: Multiplication): string {
    const left: string = generateExpression(multiplication.left);
    const right: string = generateExpression(multiplication.right);
    return `${left} * ${right}`;
}

function generateDivision(division: Division): string {
    const left: string = generateExpression(division.left);
    const right: string = generateExpression(division.right);
    return `${left} / ${right}`;
}

function generateMod(mod: Mod): string {
    const left: string = generateExpression(mod.left);
    const right: string = generateExpression(mod.right);
    return `${left} % ${right}`;
}

function generateLeftPipe(leftPipe: LeftPipe): string {
    return generateExpression(flattenLeftPipe(leftPipe));
}

function generateRightPipe(rightPipe: RightPipe): string {
    const left: string = generateExpression(rightPipe.left);
    const right: string = generateExpression(rightPipe.right);
    return `${left}(${right})`;
}

function generateModuleReference(moduleReference: ModuleReference): string {
    switch (moduleReference.path.length) {
        case 0: {
            return `(arg0) => arg0.${generateExpression(moduleReference.value)}`;
        }
        default: {
            const left: string = moduleReference.path.join(".");
            const right: string = generateExpression(moduleReference.value);
            return `${left}.${right}`;
        }
    }
}

function generateFunctionCall(functionCall: FunctionCall): string {
    const args: string = (function(y: any) {
        return y.join(", ");
    })(List.map(generateExpression, functionCall.args));
    return `${functionCall.name}(${args})`;
}

function generateLambda(lambda: Lambda): string {
    const isSimple: boolean = isSimpleValue(lambda.body.kind);
    const args: string = (function(y: any) {
        return y.join(", ");
    })(List.map(function(arg: any) {
        return `${arg}: any`;
    }, lambda.args));
    const body: string = isSimple ? generateExpression(lambda.body) : (function(y: any) {
        return prefixLines(y, 4);
    })(generateExpression(lambda.body));
    if (isSimple) {
        return `function(${args}) {\n    return ${body};\n}`;
    } else {
        return `function(${args}) {\n${body}\n}`;
    }
}

function generateLambdaCall(lambdaCall: LambdaCall): string {
    const args: string = (function(y: any) {
        return y.join(", ");
    })(List.map(function(arg: any) {
        return `${arg}: any`;
    }, lambdaCall.lambda.args));
    const argsValues: string = (function(y: any) {
        return y.join(", ");
    })(List.map(generateExpression, lambdaCall.args));
    const body: string = generateExpression(lambdaCall.lambda.body);
    return `(function(${args}) {\n    return ${body};\n})(${argsValues})`;
}

function generateEquality(equality: Equality): string {
    const left: string = generateExpression(equality.left);
    const right: string = generateExpression(equality.right);
    return `${left} === ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left: string = generateExpression(inEquality.left);
    const right: string = generateExpression(inEquality.right);
    return `${left} !== ${right}`;
}

function generateLessThan(lessThan: LessThan): string {
    const left: string = generateExpression(lessThan.left);
    const right: string = generateExpression(lessThan.right);
    return `${left} < ${right}`;
}

function generateLessThanOrEqual(lessThanOrEqual: LessThanOrEqual): string {
    const left: string = generateExpression(lessThanOrEqual.left);
    const right: string = generateExpression(lessThanOrEqual.right);
    return `${left} <= ${right}`;
}

function generateGreaterThan(greaterThan: GreaterThan): string {
    const left: string = generateExpression(greaterThan.left);
    const right: string = generateExpression(greaterThan.right);
    return `${left} > ${right}`;
}

function generateGreaterThanOrEqual(greaterThanOrEqual: GreaterThanOrEqual): string {
    const left: string = generateExpression(greaterThanOrEqual.left);
    const right: string = generateExpression(greaterThanOrEqual.right);
    return `${left} >= ${right}`;
}

function generateAnd(and: And): string {
    const left: string = generateExpression(and.left);
    const right: string = generateExpression(and.right);
    return `${left} && ${right}`;
}

function generateOr(or: Or): string {
    const left: string = generateExpression(or.left);
    const right: string = generateExpression(or.right);
    return `${left} || ${right}`;
}

function generateListPrepend(prepend: ListPrepend): string {
    const left: string = generateExpression(prepend.left);
    const right: string = generateExpression(prepend.right);
    return `[ ${left}, ...${right} ]`;
}

function generateExpression(expression: Expression, parentTypeArguments?: string[], parentTypes?: Type[]): string {
    switch (expression.kind) {
        case "Value": {
            return generateValue(expression);
        }
        case "StringValue": {
            return generateStringValue(expression);
        }
        case "FormatStringValue": {
            return generateFormatStringValue(expression);
        }
        case "ListValue": {
            return generateListValue(expression);
        }
        case "ListRange": {
            return generateListRange(expression);
        }
        case "ObjectLiteral": {
            return generateObjectLiteral(expression);
        }
        case "IfStatement": {
            const actualParentTypeArguments: string[] = parentTypeArguments || [ ];
            return generateIfStatement(expression, actualParentTypeArguments, false, false);
        }
        case "CaseStatement": {
            const actualParentTypeArguments: string[] = parentTypeArguments || [ ];
            return generateCaseStatement(expression, actualParentTypeArguments);
        }
        case "Addition": {
            return generateAddition(expression);
        }
        case "Subtraction": {
            return generateSubtraction(expression);
        }
        case "Multiplication": {
            return generateMultiplication(expression);
        }
        case "Division": {
            return generateDivision(expression);
        }
        case "Mod": {
            return generateMod(expression);
        }
        case "And": {
            return generateAnd(expression);
        }
        case "Or": {
            return generateOr(expression);
        }
        case "ListPrepend": {
            return generateListPrepend(expression);
        }
        case "LeftPipe": {
            return generateLeftPipe(expression);
        }
        case "RightPipe": {
            return generateRightPipe(expression);
        }
        case "ModuleReference": {
            return generateModuleReference(expression);
        }
        case "FunctionCall": {
            return generateFunctionCall(expression);
        }
        case "Lambda": {
            return generateLambda(expression);
        }
        case "LambdaCall": {
            return generateLambdaCall(expression);
        }
        case "Constructor": {
            return generateConstructor(expression);
        }
        case "Equality": {
            return generateEquality(expression);
        }
        case "InEquality": {
            return generateInEquality(expression);
        }
        case "LessThan": {
            return generateLessThan(expression);
        }
        case "LessThanOrEqual": {
            return generateLessThanOrEqual(expression);
        }
        case "GreaterThan": {
            return generateGreaterThan(expression);
        }
        case "GreaterThanOrEqual": {
            return generateGreaterThanOrEqual(expression);
        }
    }
}

function collectTypeArguments(type_: Type): string[] {
    switch (type_.kind) {
        case "GenericType": {
            const { name } = type_;
            if (isBuiltinType(name)) {
                return [ ];
            } else {
                return [ name ];
            };
        }
        case "FixedType": {
            const { name, args } = type_;
            if (isBuiltinType(name)) {
                return [ ];
            } else {
                return List.foldl(function(xs: any, ys: any) {
                    return List.append(ys, xs);
                }, [ ], List.map(collectTypeArguments, args));
            };
        }
        case "FunctionType": {
            const { args } = type_;
            return List.foldl(function(xs: any, ys: any) {
            return List.append(ys, xs);
        }, [ ], List.map(collectTypeArguments, args));
        }
        case "ObjectLiteralType": {
            return [ ];
        }
    }
}

function generateDoExpression(expression: DoExpression, parentTypeArguments: string[], parentTypes: Type[], imports: Import[]): string {
    switch (expression.kind) {
        case "Const": {
            return generateConst(expression, imports, true);
        }
        case "Function": {
            return generateFunction(expression, parentTypeArguments, parentTypes, imports);
        }
        case "FunctionCall": {
            return (function(y: any) {
            return "await " + y + ";";
        })(generateFunctionCall(expression));
        }
        case "ModuleReference": {
            return (function(y: any) {
            return "await " + y + ";";
        })(generateModuleReference(expression));
        }
        case "IfStatement": {
            return generateIfStatement(expression, parentTypeArguments, true, true);
        }
    }
}

function generateDoBlock(doBody: DoBlock, parentTypeArguments: string[], parentTypes: Type[], imports: Import[]): string {
    return (function(y: any) {
        return y.join("\n");
    })(List.map(function(expression: any) {
        return generateDoExpression(expression, parentTypeArguments, parentTypes, imports);
    }, doBody.expressions));
}

function generateFunctionArg(arg: FunctionArgsUnion, imports: Import[]): string {
    switch (arg.kind) {
        case "FunctionArg": {
            const { name, type } = arg;
            return `${name}: ${generateTopLevelType(type, imports)}`;
        }
        case "AnonFunctionArg": {
            const { index, type } = arg;
            return `_${index}: ${generateTopLevelType(type, imports)}`;
        }
    }
}

function generateFunction(function_: Function, parentTypeArguments: string[], parentTypes: Type[], imports: Import[]): string {
    const args: string = (function(y: any) {
        return y.join(", ");
    })(List.map(function(arg: any) {
        return generateFunctionArg(arg, imports);
    }, function_.args));
    const flattenedArgTypeArguments: string[] = List.foldl(function(xs: any, ys: any) {
        return List.append(ys, xs);
    }, [ ], List.map(function(arg: any) {
        return collectTypeArguments(arg.type);
    }, function_.args));
    const typeArguments: string[] = List.append(flattenedArgTypeArguments, collectTypeArguments(function_.returnType));
    const filteredTypeArguments: string[] = typeArguments.filter(function(value: any, index: any, arr: any) {
        return arr.indexOf(value) === index && parentTypeArguments.indexOf(value) === -1;
    });
    const maybeLetBody: string = generateLetBlock(function_.letBody, List.append(filteredTypeArguments, parentTypeArguments), imports);
    const isAsync: boolean = function_.doBody !== null;
    const maybeAsyncPrefix: string = isAsync ? "async " : "";
    const maybeDoBody: string = function_.doBody !== null ? (function(y: any) {
        return `\n${prefixLines(y, 4)}`;
    })(generateDoBlock(function_.doBody, parentTypeArguments, parentTypes, imports)) : "";
    const returnType: string = isAsync ? generateTopLevelType({
        kind: "FixedType",
        name: "Promise",
        args: [ function_.returnType ]
    }, imports) : generateTopLevelType(function_.returnType, imports);
    const isSimpleBody: boolean = isSimpleValue(function_.body.kind);
    const bodyPrefix: string = isSimpleBody ? "return " : "";
    const bodySuffix: string = isSimpleBody ? ";" : "";
    const joinedTypeArguments: string[] = List.append(typeArguments, parentTypeArguments);
    const allParentTypes: Type[] = List.append(parentTypes, [ function_.returnType ]);
    const body: string = (function(y: any) {
        return prefixLines(y, 4);
    })((function(y: any) {
        return bodyPrefix + y + bodySuffix;
    })(generateExpression(function_.body, joinedTypeArguments, allParentTypes)));
    const typeArgumentsString: string = filteredTypeArguments.length === 0 ? "" : `<${filteredTypeArguments.join(", ")}>`;
    return (function(y: any) {
        return y.join("\n");
    })([ `${maybeAsyncPrefix}function ${function_.name}${typeArgumentsString}(${args}): ${returnType} {${maybeLetBody}${maybeDoBody}`, `${body}`, `}` ]);
}

function generateInlineIf(expression: IfStatement): string {
    const ifBody: string = (function (): any {
        switch (expression.ifBody.kind) {
            case "IfStatement": {
                return `( ${generateInlineIf(expression.ifBody)} )`;
            }
            default: {
                return generateExpression(expression.ifBody);
            }
        }
    })();
    const elseBody: string = (function (): any {
        switch (expression.elseBody.kind) {
            case "IfStatement": {
                return `( ${generateInlineIf(expression.elseBody)} )`;
            }
            default: {
                return generateExpression(expression.elseBody);
            }
        }
    })();
    return `${generateExpression(expression.predicate)} ? ${ifBody} : ${elseBody}`;
}

function generateInlineCase(expression: CaseStatement): string {
    return `(function (): any {\n${prefixLines(generateExpression(expression), 4)}\n})()`;
}

function generateNestedConst(constDef: Const, body: string, imports: Import[]): string {
    const typeDef: string = generateTopLevelType(constDef.type, imports);
    const generatedBlocks: string[] = List.map(function(block: any) {
        return generateBlock(block, [ ], [ ], imports);
    }, constDef.letBody);
    const joinedBlocks: string = (function(y: any) {
        return prefixLines(y, 4);
    })(generatedBlocks.join("\n"));
    return `(function(): ${typeDef} {\n${joinedBlocks}\n    return ${body};\n})()`;
}

function generateConst(constDef: Const, imports: Import[], isAsync: boolean): string {
    const body: string = (function (): any {
        switch (constDef.value.kind) {
            case "IfStatement": {
                if (constDef.letBody.length === 0) {
                    return generateInlineIf(constDef.value);
                } else {
                    return generateNestedConst(constDef, generateInlineIf(constDef.value), imports);
                };
            }
            case "CaseStatement": {
                if (constDef.letBody.length === 0) {
                    return generateInlineCase(constDef.value);
                } else {
                    return generateNestedConst(constDef, generateInlineCase(constDef.value), imports);
                };
            }
            default: {
                if (constDef.letBody.length === 0) {
                    return generateExpression(constDef.value);
                } else {
                    return generateNestedConst(constDef, generateExpression(constDef.value), imports);
                };
            }
        }
    })();
    const maybeAsyncPrefix: string = isAsync ? "await " : "";
    const typeDef: string = generateTopLevelType(constDef.type, imports);
    return `const ${constDef.name}: ${typeDef} = ${maybeAsyncPrefix}${body};`;
}

function generateBlock(syntax: Block, parentTypeArguments?: string[], parentTypes?: Type[], imports?: Import[]): string {
    const actualParentTypeArguments: string[] = parentTypeArguments || [ ];
    const actualParentTypes: Type[] = parentTypes || [ ];
    const actualImports: Import[] = imports || [ ];
    switch (syntax.kind) {
        case "Import": {
            return generateImportBlock(syntax);
        }
        case "Export": {
            return generateExportBlock(syntax);
        }
        case "UnionType": {
            return generateUnionType(syntax, actualImports);
        }
        case "UnionUntaggedType": {
            return generateUnionUntaggedType(syntax);
        }
        case "TypeAlias": {
            return generateTypeAlias(syntax, actualImports);
        }
        case "Function": {
            return generateFunction(syntax, actualParentTypeArguments, actualParentTypes, actualImports);
        }
        case "Const": {
            return generateConst(syntax, actualImports, false);
        }
        case "Comment": {
            return "";
        }
        case "MultilineComment": {
            return "";
        }
    }
}

function generateTypescript(module: Module): string {
    const onlyImports: Import[] = List.filter(function(block: any) {
        return block.kind === "Import";
    }, module.body);
    const testExports: Export = exportTests(module);
    const withTestExports: Block[] = [ testExports, ...module.body ];
    return (function(y: any) {
        return y.join("\n\n");
    })(List.filter(function(line: any) {
        return line.length > 0;
    }, List.map(function(block: any) {
        return generateBlock(block, [ ], [ ], onlyImports);
    }, withTestExports)));
}
