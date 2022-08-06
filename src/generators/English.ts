import * as List from "../stdlib/List";

import * as Aliases from "../types";
import { TypeAlias, Property } from "../types";

import * as Blocks from "../types";
import { Function, FunctionArg, FunctionArgsUnion, Const, ImportModule, Import, Export, Module } from "../types";

import * as Boolean from "../types";
import { Equality, InEquality, LessThan, LessThanOrEqual, GreaterThan, GreaterThanOrEqual, And, Or, ListPrepend } from "../types";

import * as Control from "../types";
import { IfStatement, ListDestructurePart, BranchPattern, Branch, CaseStatement } from "../types";

import * as Functions from "../types";
import { FunctionCall, Lambda, LambdaCall } from "../types";

import * as Objects from "../types";
import { ObjectLiteral, Field, ModuleReference } from "../types";

import * as Operators from "../types";
import { Addition, Subtraction, Multiplication, Division, LeftPipe, RightPipe } from "../types";

import * as Values from "../types";
import { Value, StringValue, FormatStringValue, ListValue, ListRange } from "../types";

import { Tag, UnionType, Type, TagArg, Block, Constructor, Expression } from "../types";

import { prefixLines } from "./Common";

export { generateEnglish };

function generateTag(tag: Tag): string {
    function generateTypeArg(arg: TagArg): string {
        return (function(type_: any) {
            return arg.name + ": " + type_ + "";
        })(generateType(arg.type));
    }
    const typeDefArgs: string = (function(y: any) {
        return y.join(",\n    ");
    })(List.map(generateTypeArg, tag.args));
    const funcDefArgsStr: string = tag.args.length > 0 ? `{ ${typeDefArgs} }` : "";
    return (function(y: any) {
        return y + funcDefArgsStr;
    })(generateType({
        kind: "FixedType",
        name: tag.name,
        args: [ ]
    }));
}

function generateUnionType(syntax: UnionType): string {
    const tags: string = (function(y: any) {
        return y.join("\n| ");
    })(List.map(generateTag, syntax.tags));
    const prefixed: string = prefixLines(tags, 4);
    return `type ${generateType(syntax.type)} =\n${tags}`;
}

function generateProperty(syntax: Property): string {
    return `${syntax.name}: ${generateType(syntax.type)}`;
}

function generateTypeAlias(syntax: TypeAlias): string {
    const properties: string = (function(y: any) {
        return y.join(",\n    ");
    })(List.map(generateProperty, syntax.properties));
    const typeDef: string = generateType(syntax.type);
    return `type alias ${typeDef} = {\n    ${properties}\n}`;
}

function generateListType(args: Type[]): string {
    if (args.length > 0 && args[0].kind === "GenericType") {
        return `List ${generateType(args[0])}`;
    } else {
        const fixedArgs: Type[] = List.filter(function(type_: any) {
            return type_.kind === "FixedType";
        }, args);
        switch (fixedArgs.length) {
            case 0: {
                return "List any";
            }
            case fixedArgs.length: {
                if (fixedArgs.length === 1) {
                    const [ x ] = fixedArgs;
                    if (x.kind === "FixedType" && x.args.length > 0) {
                    return `List (${generateType(x)})`;
                } else {
                    return `List ${generateType(x)}`;
                };
                }
            }
            default: {
                return `List (${fixedArgs.map(generateType).join(" | ")})`;
            }
        };
    }
}

function generateTopLevelType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            return generateType(type_);
        }
        case "FixedType": {
            const { name, args } = type_;
            if (name === "List") {
                return generateType(type_);
            } else {
                const genericArgs: Type[] = List.filter(function(type_: any) {
                    return type_.kind === "GenericType" || type_.kind === "FixedType";
                }, args);
                if (genericArgs.length === 0) {
                    return name;
                } else {
                    return `${name} ${genericArgs.map(generateType).join(" ")}`;
                };
            };
        }
        case "FunctionType": {
            return generateType(type_);
        }
    }
}

function generateType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            const { name } = type_;
            return name;
        }
        case "FixedType": {
            const { name, args } = type_;
            if (name === "List") {
                return generateListType(args);
            } else {
                const genericArgs: Type[] = List.filter(function(type_: any) {
                    return type_.kind === "GenericType";
                }, args);
                if (genericArgs.length === 0) {
                    return name;
                } else {
                    return `${name} ${genericArgs.map(generateType).join(" ")}`;
                };
            };
        }
        case "FunctionType": {
            const { args } = type_;
            return `(${args.map(generateType).join(" -> ")})`;
        }
    }
}

function generateField(field: Field): string {
    const value: string = generateExpression(field.value);
    return `${field.name}: ${value}`;
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    const fields: string = (function(y: any) {
        return y.join(",\n    ");
    })(literal.fields.map(generateField));
    if (literal.base === null) {
        if (literal.fields.length === 1) {
            return `{ ${fields} }`;
        } else {
            return `{\n   ${fields}\n}`;
        };
    } else {
        if (literal.fields.length === 1) {
            return `{ ${literal.base.body}, ${fields} }`;
        } else {
            return `{\n    ${literal.base.body},\n    ${fields}\n}`;
        };
    }
}

function generateValue(value: Value): string {
    return value.body;
}

function generateStringValue(string: StringValue): string {
    return `"${string.body}"`;
}

function generateFormatStringValue(string: FormatStringValue): string {
    return "`" + string.body + "`";
}

function generateListValue(list: ListValue): string {
    switch (list.items.length) {
        case 0: {
            return "An empty list";
        }
        case list.items.length: {
            if (list.items.length === 1) {
                const [ x ] = list.items;
                return `A list containing ${generateExpression(x)} only`;
            }
        }
        default: {
            return `A list containing:\n${prefixLines(list.items.map(generateExpression).join(",\n"), 4)}`;
        }
    }
}

function generateListRange(list: ListRange): string {
    return `[ ${list.start.body}..${list.end.body} ]`;
}

function generateLetBlock(body: Block[]): string {
    switch (body.length) {
        case 0: {
            return "";
        }
        case body.length: {
            if (body.length >= 1) {
                const [ x, ...ys ] = body;
                const prefixedLet: string = prefixLines("\nlet", 4);
                const prefixedBody: string = (function(y: any) {
                    return y.join("\n\n");
                })(List.map(generateBlock, body));
                const prefixedLines: string = prefixLines(prefixedBody, 8);
                const prefixedIn: string = prefixLines("\nin", 4);
                return `${prefixedLet}\n${prefixedLines}${prefixedIn}${prefixLines("", 8)}`;
            }
        }
        default: {
            return "";
        }
    }
}

function generateIfStatement(ifStatement: IfStatement): string {
    const maybeIfLetBody: string = generateLetBlock(ifStatement.ifLetBody);
    const maybeElseLetBody: string = generateLetBlock(ifStatement.elseLetBody);
    const predicate: string = generateExpression(ifStatement.predicate);
    const ifIndent: number = maybeIfLetBody === "" ? 4 : 8;
    const ifBody: string = (function(lines: any) {
        return prefixLines(lines, ifIndent);
    })(generateExpression(ifStatement.ifBody));
    const elseIndent: number = maybeElseLetBody === "" ? 4 : 8;
    const elseBody: string = (function(lines: any) {
        return prefixLines(lines, elseIndent);
    })(generateExpression(ifStatement.elseBody));
    return `if ${predicate} then${maybeIfLetBody}\n${ifBody}\nelse${maybeElseLetBody}\n${elseBody}\n`;
}

function generateConstructor(constructor: Constructor): string {
    switch (constructor.pattern.fields.length) {
        case 0: {
            return constructor.constructor;
        }
        default: {
            return `${constructor.constructor} ${generateObjectLiteral(constructor.pattern)}`;
        }
    }
}

function generateListDestructurePart(part: ListDestructurePart): string {
    switch (part.kind) {
        case "EmptyList": {
            return "An empty list";
        }
        case "StringValue": {
            const { body } = part;
            return `"${body}"`;
        }
        case "FormatStringValue": {
            const { body } = part;
            return "`" + body + "`";
        }
        case "Value": {
            const { body } = part;
            return body;
        }
        case "Destructure": {
            const { pattern } = part;
            if (pattern.length === 0) {
                return part.constructor;
            } else {
                return `${part.constructor} ${pattern}`;
            };
        }
    }
}

function generateBranchPattern(branchPattern: BranchPattern): string {
    switch (branchPattern.kind) {
        case "Destructure": {
            const { pattern } = branchPattern;
            if (pattern.length === 0) {
                return branchPattern.constructor;
            } else {
                return `${branchPattern.constructor} ${pattern}`;
            };
        }
        case "StringValue": {
            const { body } = branchPattern;
            return `"${body}"`;
        }
        case "FormatStringValue": {
            const { body } = branchPattern;
            return "`" + body + "`";
        }
        case "EmptyList": {
            return "An empty list";
        }
        case "ListDestructure": {
            const { parts } = branchPattern;
            return (function(y: any) {
            return y.join(" is in a list element from ");
        })(List.map(generateListDestructurePart, parts));
        }
        case "Default": {
            return "Nothing else matches";
        }
    }
}

function generateBranch(branch: Branch): string {
    const maybeLetBody: string = generateLetBlock(branch.letBody);
    const bodyIndent: number = maybeLetBody === "" ? 4 : 9;
    const body: string = (function(y: any) {
        return prefixLines(`return ${y}`, bodyIndent);
    })(generateExpression(branch.body));
    const pattern: string = generateBranchPattern(branch.pattern);
    return `Is it ${pattern}? ->${maybeLetBody}\n${body}`;
}

function generateCaseStatement(caseStatement: CaseStatement): string {
    const predicate: string = generateExpression(caseStatement.predicate);
    const branches: string = (function(y: any) {
        return prefixLines(y, 4);
    })((function(y: any) {
        return y.join("\n\n");
    })(List.map(generateBranch, caseStatement.branches)));
    return `Check the value of ${predicate}\n${branches}`;
}

function generateAddition(addition: Addition): string {
    const left: string = generateExpression(addition.left);
    const right: string = generateExpression(addition.right);
    return `${left} plus ${right}`;
}

function generateSubtraction(subtraction: Subtraction): string {
    const left: string = generateExpression(subtraction.left);
    const right: string = generateExpression(subtraction.right);
    return `${left} subtracts ${right}`;
}

function generateMultiplication(multiplication: Multiplication): string {
    const left: string = generateExpression(multiplication.left);
    const right: string = generateExpression(multiplication.right);
    return `${left} multiplied by ${right}`;
}

function generateDivision(division: Division): string {
    const left: string = generateExpression(division.left);
    const right: string = generateExpression(division.right);
    return `${left} divided by ${right}`;
}

function generateLeftPipe(leftPipe: LeftPipe): string {
    const left: string = generateExpression(leftPipe.left);
    const right: string = generateExpression(leftPipe.right);
    return `Send ${left} as the last argument to ${right}`;
}

function generateRightPipe(rightPipe: RightPipe): string {
    const left: string = generateExpression(rightPipe.left);
    const right: string = generateExpression(rightPipe.right);
    return `Send ${right} as the last argument to ${left}`;
}

function generateModuleReference(moduleReference: ModuleReference): string {
    const left: string = moduleReference.path.join(".");
    const right: string = generateExpression(moduleReference.value);
    return `${left}.${right}`;
}

function generateFunctionCallArg(arg: Expression): string {
    switch (arg.kind) {
        case "Constructor": {
            return `(${generateExpression(arg)})`;
        }
        case "FunctionCall": {
            return `(${generateExpression(arg)})`;
        }
        case "ModuleReference": {
            const { value } = arg;
            switch (value.kind) {
                case "Constructor": {
                    return `(${generateExpression(arg)})`;
                }
                case "FunctionCall": {
                    return `(${generateExpression(arg)})`;
                }
                default: {
                    return generateExpression(arg);
                }
            };
        }
        case "ListPrepend": {
            return `(${generateExpression(arg)})`;
        }
        default: {
            return generateExpression(arg);
        }
    }
}

function generateFunctionCall(functionCall: FunctionCall): string {
    if (functionCall.args.length === 0) {
        return `${functionCall.name}()`;
    } else {
        const args: string = (function(y: any) {
            return y.join(" ");
        })(List.map(generateFunctionCallArg, functionCall.args));
        return `${functionCall.name} ${args}`;
    }
}

function generateLambda(lambda: Lambda): string {
    const args: string = (function(y: any) {
        return y.join(" ");
    })(List.map(function(arg: any) {
        return arg;
    }, lambda.args));
    const body: string = generateExpression(lambda.body);
    return `(\\${args} -> ${body})`;
}

function generateLambdaCall(lambdaCall: LambdaCall): string {
    const args: string = (function(y: any) {
        return y.join(", ");
    })(List.map(function(arg: any) {
        return `${arg}: any`;
    }, lambdaCall.args));
    const argsValues: string = (function(y: any) {
        return y.join(", ");
    })(List.map(generateExpression, lambdaCall.args));
    const body: string = generateExpression(lambdaCall.lambda.body);
    return `(function(${args}) {\n    return ${body};\n})(${argsValues})`;
}

function generateEquality(equality: Equality): string {
    const left: string = generateExpression(equality.left);
    const right: string = generateExpression(equality.right);
    return `${left} is equal to ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left: string = generateExpression(inEquality.left);
    const right: string = generateExpression(inEquality.right);
    return `${left} is not equal to ${right}`;
}

function generateLessThan(lessThan: LessThan): string {
    const left: string = generateExpression(lessThan.left);
    const right: string = generateExpression(lessThan.right);
    return `${left} is less than ${right}`;
}

function generateLessThanOrEqual(lessThanOrEqual: LessThanOrEqual): string {
    const left: string = generateExpression(lessThanOrEqual.left);
    const right: string = generateExpression(lessThanOrEqual.right);
    return `${left} is less than or equal to ${right}`;
}

function generateGreaterThan(greaterThan: GreaterThan): string {
    const left: string = generateExpression(greaterThan.left);
    const right: string = generateExpression(greaterThan.right);
    return `${left} is greater than ${right}`;
}

function generateGreaterThanOrEqual(greaterThanOrEqual: GreaterThanOrEqual): string {
    const left: string = generateExpression(greaterThanOrEqual.left);
    const right: string = generateExpression(greaterThanOrEqual.right);
    return `${left} is greater than or equal to ${right}`;
}

function generateAnd(and: And): string {
    const left: string = generateExpression(and.left);
    const right: string = generateExpression(and.right);
    return `${left} and ${right}`;
}

function generateOr(or: Or): string {
    const left: string = generateExpression(or.left);
    const right: string = generateExpression(or.right);
    return `${left} or ${right}`;
}

function generateListPrepend(prepend: ListPrepend): string {
    const left: string = generateExpression(prepend.left);
    const right: string = generateExpression(prepend.right);
    return `Add ${left} as a list item to the front of ${right}`;
}

function generateExpression(expression: Expression): string {
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
            return generateIfStatement(expression);
        }
        case "CaseStatement": {
            return generateCaseStatement(expression);
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

function generateFunctionArg(arg: FunctionArgsUnion): string {
    switch (arg.kind) {
        case "FunctionArg": {
            const { name, type } = arg;
            return `${name} with the type ${generateType(type)}`;
        }
        case "AnonFunctionArg": {
            const { index, type } = arg;
            return `_${index} with the type ${generateType(type)}`;
        }
    }
}

function generateFunction(function_: Function): string {
    const args: string = (function(y: any) {
        return y.join("\n");
    })(List.map(generateFunctionArg, function_.args));
    const maybeLetBody: string = generateLetBlock(function_.letBody);
    const returnType: string = generateTopLevelType(function_.returnType);
    const bodyIndent: number = maybeLetBody === "" ? 4 : 8;
    const body: string = (function(y: any) {
        return prefixLines(y, bodyIndent);
    })(generateExpression(function_.body));
    return (function(y: any) {
        return y.join("\n");
    })([ `${function_.name} is a function with the arguments:`, prefixLines(args, 4), `${function_.name} returns a value of the type ${returnType}`, `${function_.name} is defined as: ${maybeLetBody}`, `${body}` ]);
}

function generateConst(constDef: Const): string {
    const body: string = (function(y: any) {
        return prefixLines(y, 4);
    })(generateExpression(constDef.value));
    const typeDef: string = generateTopLevelType(constDef.type);
    return (function(y: any) {
        return y.join("\n");
    })([ `${constDef.name} is a constant with the type ${typeDef}`, `${constDef.name} is assigned to:`, `${body}` ]);
}

function generateImportModule(module: ImportModule): string {
    const partExposing: string = module.exposing.length === 0 ? "" : ` exposing (${module.exposing.join(", ")} )`;
    switch (module.alias.kind) {
        case "Just": {
            const { value } = module.alias;
            return `import ${module.name} as ${value}${partExposing}`;
        }
        case "Nothing": {
            return `import ${module.name}${partExposing}`;
        }
    }
}

function generateImportBlock(imports: Import): string {
    return (function(y: any) {
        return y.join("\n");
    })(List.map(generateImportModule, imports.modules));
}

function generateExportBlock(exports: Export): string {
    return `exposing (${exports.names.join(", ")})`;
}

function generateBlock(syntax: Block): string {
    switch (syntax.kind) {
        case "Import": {
            return generateImportBlock(syntax);
        }
        case "Export": {
            return generateExportBlock(syntax);
        }
        case "UnionType": {
            return generateUnionType(syntax);
        }
        case "TypeAlias": {
            return generateTypeAlias(syntax);
        }
        case "Function": {
            return generateFunction(syntax);
        }
        case "Const": {
            return generateConst(syntax);
        }
        case "Comment": {
            return "";
        }
        case "MultilineComment": {
            return "";
        }
    }
}

function generateEnglish(module: Module): string {
    return (function(y: any) {
        return y.join("\n\n");
    })(List.filter(function(line: any) {
        return line.length > 0;
    }, List.map(generateBlock, module.body)));
}
