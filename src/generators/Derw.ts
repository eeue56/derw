import * as List from "../stdlib/List";

import * as Aliases from "../types";
import {
    TypeAlias,
    Property,
    Typeclass,
    TypeclassFunction,
    Impl,
} from "../types";

import * as Blocks from "../types";
import {
    Function,
    FunctionArg,
    FunctionArgsUnion,
    Const,
    ImportModule,
    Import,
    Export,
    Module,
} from "../types";

import * as Boolean from "../types";
import {
    Equality,
    InEquality,
    LessThan,
    LessThanOrEqual,
    GreaterThan,
    GreaterThanOrEqual,
    And,
    Or,
    ListPrepend,
} from "../types";

import * as Comments from "../types";
import { Comment, MultilineComment } from "../types";

import * as Control from "../types";
import {
    IfStatement,
    ElseIfStatement,
    ListDestructurePart,
    BranchPattern,
    Branch,
    CaseStatement,
    DoBlock,
    DoExpression,
} from "../types";

import * as Functions from "../types";
import { FunctionCall, Lambda, LambdaCall } from "../types";

import * as Objects from "../types";
import { ObjectLiteral, Field, ModuleReference } from "../types";

import * as Operators from "../types";
import {
    Addition,
    Subtraction,
    Multiplication,
    Division,
    Mod,
    LeftPipe,
    RightPipe,
} from "../types";

import * as Values from "../types";
import {
    Value,
    StringValue,
    FormatStringValue,
    ListValue,
    ListRange,
} from "../types";

import {
    Tag,
    UnionType,
    UnionUntaggedType,
    Type,
    TagArg,
    Block,
    Constructor,
    Expression,
    isSimpleValue,
} from "../types";

import { prefixLines } from "./Common";

export { generateDerw };
export { generateExpression };

function generateTag(tag: Tag): string {
    function generateTypeArg(arg: TagArg): string {
        return (function (type_: any) {
            return arg.name + ": " + type_ + "";
        })(generateType(arg.type));
    }
    const typeDefArgs: string = (function (y: any) {
        return y.join(",\n    ");
    })(List.map(generateTypeArg, tag.args));
    const funcDefArgsStr: string =
        tag.args.length > 0 ? ` { ${typeDefArgs} }` : "";
    return (function (y: any) {
        return y + funcDefArgsStr;
    })(
        generateType({
            kind: "FixedType",
            name: tag.name,
            args: [],
        })
    );
}

function generateUnionType(syntax: UnionType): string {
    const tags: string = (function (y: any) {
        return y.join("\n| ");
    })(List.map(generateTag, syntax.tags));
    const prefixed: string = prefixLines(tags, 4);
    return `type ${generateType(syntax.type)} =\n${prefixed}`;
}

function generateUnionUntaggedType(syntax: UnionUntaggedType): string {
    const values: string = (function (y: any) {
        return y.join("\n| ");
    })(List.map(generateStringValue, syntax.values));
    const prefixed: string = prefixLines(values, 4);
    return `type ${generateType(syntax.type)} =\n${prefixed}`;
}

function generateProperty(syntax: Property): string {
    const generatedType: string = generateTopLevelType(syntax.type);
    switch (syntax.type.kind) {
        case "FunctionType": {
            return `${syntax.name}: ${generatedType.slice(1, -1)}`;
        }
        default: {
            return `${syntax.name}: ${generatedType}`;
        }
    }
}

function generateTypeAlias(syntax: TypeAlias): string {
    const properties: string = (function (y: any) {
        return y.join(",\n    ");
    })(List.map(generateProperty, syntax.properties));
    const typeDef: string = generateType(syntax.type);
    if (syntax.properties.length === 0) {
        return `type alias ${typeDef} = {\n}`;
    } else {
        return `type alias ${typeDef} = {\n    ${properties}\n}`;
    }
}

function generateTypeclassFunction(syntax: TypeclassFunction): string {
    const argTypes: string[] = List.map(generateTopLevelType, syntax.args);
    const returnType: string = generateTopLevelType(syntax.returnType);
    const types: string = (function (y: any) {
        return y.join(" -> ");
    })(List.append(argTypes, [returnType]));
    return `${syntax.name}: ${types}`;
}

function generateTypeclass(syntax: Typeclass): string {
    const variables: string = (function (y: any) {
        return y.join(" ");
    })(List.map(generateType, syntax.variables));
    const functions: string = (function (y: any) {
        return y.join("\n\n");
    })(
        List.map(
            function (line: any) {
                return prefixLines(line, 4);
            },
            List.map(generateTypeclassFunction, syntax.functions)
        )
    );
    return `typeclass ${syntax.name} ${variables}\n${functions}`;
}

function generateImpl(syntax: Impl): string {
    const qualifier: string = generateType(syntax.qualifier);
    const blocks: string = (function (y: any) {
        return y.join("\n\n");
    })(
        List.map(
            function (line: any) {
                return prefixLines(line, 4);
            },
            List.map(generateBlock, syntax.functions)
        )
    );
    return `impl ${syntax.name} ${qualifier}\n${blocks}`;
}

function generateListType(args: Type[]): string {
    if (args.length > 0 && args[0].kind === "GenericType") {
        return `List ${generateType(args[0])}`;
    } else {
        const fixedArgs: Type[] = List.filter(function (type_: any) {
            return type_.kind === "FixedType";
        }, args);
        switch (fixedArgs.length) {
            case 0: {
                return "List any";
            }
            case fixedArgs.length: {
                if (fixedArgs.length === 1) {
                    const [x] = fixedArgs;
                    if (x.kind === "FixedType" && x.args.length > 0) {
                        return `List (${generateType(x)})`;
                    } else {
                        return `List ${generateType(x)}`;
                    }
                }
            }
            default: {
                return `List (${fixedArgs.map(generateType).join(" | ")})`;
            }
        }
    }
}

function generateTopLevelType(type_: Type): string {
    switch (type_.kind) {
        case "GenericType": {
            return generateType(type_);
        }
        case "FixedType": {
            const { name, args } = type_;
            if (
                args.length > 0 &&
                args[0].kind === "FixedType" &&
                args[0].args.length > 0
            ) {
                function wrapper(x: string): string {
                    return `(${x})`;
                }
                return `${name} ${args.map(generateTopLevelType).map(wrapper).join(" ")}`;
            } else {
                const genericArgs: Type[] = List.filter(function (type_: any) {
                    return (
                        type_.kind === "GenericType" ||
                        type_.kind === "FixedType"
                    );
                }, args);
                if (genericArgs.length === 0) {
                    return name;
                } else {
                    function wrapper(newType: Type): string {
                        switch (newType.kind) {
                            case "FixedType": {
                                const { args } = newType;
                                if (args.length > 0) {
                                    return `(${generateTopLevelType(newType)})`;
                                } else {
                                    return `${generateTopLevelType(newType)}`;
                                }
                            }
                            default: {
                                return `${generateTopLevelType(newType)}`;
                            }
                        }
                    }
                    const wrappedArgs: string[] = genericArgs.map(wrapper);
                    return `${name} ${wrappedArgs.join(" ")}`;
                }
            }
        }
        case "FunctionType": {
            const { args } = type_;
            return `(${args.map(generateTopLevelType).join(" -> ")})`;
        }
        case "ObjectLiteralType": {
            return ``;
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
                const genericArgs: Type[] = List.filter(function (type_: any) {
                    return type_.kind === "GenericType";
                }, args);
                if (genericArgs.length === 0) {
                    return name;
                } else {
                    return `${name} ${genericArgs.map(generateType).join(" ")}`;
                }
            }
        }
        case "FunctionType": {
            const { args } = type_;
            return `(${args.map(generateType).join(" -> ")})`;
        }
        case "ObjectLiteralType": {
            return ``;
        }
    }
}

function generateField(field: Field): string {
    const value: string = generateExpression(field.value);
    return `${field.name}: ${value}`;
}

function generateObjectLiteral(literal: ObjectLiteral): string {
    const fields: string = (function (y: any) {
        return y.join(",\n");
    })(literal.fields.map(generateField));
    const maybePrefixed: string = prefixLines(fields, 4);
    if (literal.base === null) {
        const _res1477476904 = `${literal.fields.length}`;
        switch (_res1477476904) {
            case "0": {
                return "{ }";
            }
            case "1": {
                return `{ ${fields} }`;
            }
            default: {
                return `{\n${maybePrefixed}\n}`;
            }
        }
    } else {
        if (literal.fields.length === 1) {
            return `{ ${literal.base.body}, ${fields} }`;
        } else {
            return `{\n    ${literal.base.body},\n${maybePrefixed}\n}`;
        }
    }
}

function generateValue(value: Value): string {
    return value.body;
}

function generateStringValue(string: StringValue): string {
    return `"${string.body}"`;
}

function generateFormatStringValue(string: FormatStringValue): string {
    const split: string[] = string.body.split("\n");
    switch (split.length) {
        case split.length: {
            if (split.length === 1) {
                const [firstLine] = split;
                return "`" + firstLine + "`";
            }
        }
        case split.length: {
            if (split.length >= 1) {
                const [firstLine, ...rest] = split;
                const indentedSplit: string[] = List.map(function (line: any) {
                    return "    " + line;
                }, split);
                const joined: string = (function (y: any) {
                    return y.join("\n");
                })(indentedSplit);
                return "`\n" + joined + "\n`";
            }
        }
        default: {
            return "`" + string.body + "`";
        }
    }
}

function generateListValue(list: ListValue): string {
    switch (list.items.length) {
        case 0: {
            return "[ ]";
        }
        case list.items.length: {
            if (list.items.length === 1) {
                const [x] = list.items;
                return `[ ${generateExpression(x)} ]`;
            }
        }
        default: {
            return `[\n${prefixLines(list.items.map(generateExpression).join(",\n"), 4)}\n]`;
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
                const [x, ...ys] = body;
                const prefixedLet: string = prefixLines("\nlet", 4);
                const prefixedBody: string = (function (y: any) {
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

function generateElseIfStatement(elseIfStatement: ElseIfStatement): string {
    const predicate: string = generateExpression(elseIfStatement.predicate);
    const maybeLetBody: string = generateLetBlock(elseIfStatement.letBody);
    const indent: number = maybeLetBody === "" ? 4 : 8;
    const body: string = (function (lines: any) {
        return prefixLines(lines, indent);
    })(generateExpression(elseIfStatement.body));
    return `else if ${predicate} then${maybeLetBody}\n${body}`;
}

function generateIfStatement(ifStatement: IfStatement): string {
    const maybeIfLetBody: string = generateLetBlock(ifStatement.ifLetBody);
    const maybeElseLetBody: string = generateLetBlock(ifStatement.elseLetBody);
    const predicate: string = generateExpression(ifStatement.predicate);
    const ifIndent: number = maybeIfLetBody === "" ? 4 : 8;
    const ifBody: string = (function (lines: any) {
        return prefixLines(lines, ifIndent);
    })(generateExpression(ifStatement.ifBody));
    const elseIndent: number = maybeElseLetBody === "" ? 4 : 8;
    const elseBody: string = (function (lines: any) {
        return prefixLines(lines, elseIndent);
    })(generateExpression(ifStatement.elseBody));
    const elseIfs: string = (function (y: any) {
        return y.join("\n");
    })(List.map(generateElseIfStatement, ifStatement.elseIf));
    const prefixedElseIfs: string = elseIfs === "" ? "" : `${elseIfs}\n`;
    return `if ${predicate} then${maybeIfLetBody}\n${ifBody}\n${prefixedElseIfs}else${maybeElseLetBody}\n${elseBody}`;
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
            return "[]";
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
            }
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
            }
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
            return "[]";
        }
        case "ListDestructure": {
            const { parts } = branchPattern;
            return (function (y: any) {
                return y.join(" :: ");
            })(List.map(generateListDestructurePart, parts));
        }
        case "Default": {
            return "default";
        }
    }
}

function generateBranch(branch: Branch): string {
    const maybeLetBody: string = generateLetBlock(branch.letBody);
    const bodyIndent: number = maybeLetBody === "" ? 4 : 8;
    const body: string = (function (y: any) {
        return prefixLines(y, bodyIndent);
    })(generateExpression(branch.body));
    const pattern: string = generateBranchPattern(branch.pattern);
    return `${pattern} ->${maybeLetBody}\n${body}`;
}

function generateCaseStatement(caseStatement: CaseStatement): string {
    const predicate: string = generateExpression(caseStatement.predicate);
    const branches: string = (function (y: any) {
        return prefixLines(y, 4);
    })(
        (function (y: any) {
            return y.join("\n\n");
        })(List.map(generateBranch, caseStatement.branches))
    );
    return `case ${predicate} of\n${branches}`;
}

function needsBrackets(expression: Expression): boolean {
    switch (expression.kind) {
        case "FunctionCall": {
            return true;
        }
        default: {
            return false;
        }
    }
}

function applyBrackets(needsBrackets: boolean, generated: string): string {
    if (needsBrackets) {
        return "(" + generated + ")";
    } else {
        return generated;
    }
}

function generateAddition(addition: Addition): string {
    const left: string = applyBrackets(
        needsBrackets(addition.left),
        generateExpression(addition.left)
    );
    const right: string = applyBrackets(
        needsBrackets(addition.right),
        generateExpression(addition.right)
    );
    return `${left} + ${right}`;
}

function generateSubtraction(subtraction: Subtraction): string {
    const left: string = applyBrackets(
        needsBrackets(subtraction.left),
        generateExpression(subtraction.left)
    );
    const right: string = applyBrackets(
        needsBrackets(subtraction.right),
        generateExpression(subtraction.right)
    );
    return `${left} - ${right}`;
}

function generateMultiplication(multiplication: Multiplication): string {
    const left: string = applyBrackets(
        needsBrackets(multiplication.left),
        generateExpression(multiplication.left)
    );
    const right: string = applyBrackets(
        needsBrackets(multiplication.right),
        generateExpression(multiplication.right)
    );
    return `${left} * ${right}`;
}

function generateDivision(division: Division): string {
    const left: string = applyBrackets(
        needsBrackets(division.left),
        generateExpression(division.left)
    );
    const right: string = applyBrackets(
        needsBrackets(division.right),
        generateExpression(division.right)
    );
    return `${left} / ${right}`;
}

function generateMod(mod: Mod): string {
    const left: string = applyBrackets(
        needsBrackets(mod.left),
        generateExpression(mod.left)
    );
    const right: string = applyBrackets(
        needsBrackets(mod.right),
        generateExpression(mod.right)
    );
    return `${left} % ${right}`;
}

function generateLeftPipe(leftPipe: LeftPipe): string {
    const left: string = generateExpression(leftPipe.left);
    const right: string = generateExpression(leftPipe.right);
    return `${left}\n    |> ${right}`;
}

function generateRightPipe(rightPipe: RightPipe): string {
    const left: string = generateExpression(rightPipe.left);
    const right: string = generateExpression(rightPipe.right);
    return `${left}\n    <| ${right}`;
}

function generateModuleReference(moduleReference: ModuleReference): string {
    if (moduleReference.path.length === 0) {
        return `.${generateExpression(moduleReference.value)}`;
    } else {
        const left: string = moduleReference.path.join(".");
        const right: string = generateExpression(moduleReference.value);
        return `${left}.${right}`;
    }
}

function generateFunctionCallArg(arg: Expression): string {
    switch (arg.kind) {
        case "Constructor": {
            const { pattern } = arg;
            switch (pattern.fields.length) {
                case 0: {
                    return generateExpression(arg);
                }
                default: {
                    return `(${generateExpression(arg)})`;
                }
            }
        }
        case "FunctionCall": {
            const { args } = arg;
            switch (args.length) {
                case 0: {
                    return generateExpression(arg);
                }
                default: {
                    return `(${generateExpression(arg)})`;
                }
            }
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
            }
        }
        case "ListPrepend": {
            return `(${generateExpression(arg)})`;
        }
        case "Addition": {
            return `(${generateExpression(arg)})`;
        }
        case "Subtraction": {
            return `(${generateExpression(arg)})`;
        }
        case "Multiplication": {
            return `(${generateExpression(arg)})`;
        }
        case "Division": {
            return `(${generateExpression(arg)})`;
        }
        case "Equality": {
            return `(${generateExpression(arg)})`;
        }
        case "InEquality": {
            return `(${generateExpression(arg)})`;
        }
        case "LessThan": {
            return `(${generateExpression(arg)})`;
        }
        case "GreaterThan": {
            return `(${generateExpression(arg)})`;
        }
        case "LessThanOrEqual": {
            return `(${generateExpression(arg)})`;
        }
        case "GreaterThanOrEqual": {
            return `(${generateExpression(arg)})`;
        }
        case "LeftPipe": {
            return `(${generateExpression(arg)})`;
        }
        case "RightPipe": {
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
        const args: string = (function (y: any) {
            return y.join(" ");
        })(List.map(generateFunctionCallArg, functionCall.args));
        return `${functionCall.name} ${args}`;
    }
}

function generateLambda(lambda: Lambda): string {
    const args: string = (function (y: any) {
        return y.join(" ");
    })(
        List.map(function (arg: any) {
            return arg;
        }, lambda.args)
    );
    const body: string = generateExpression(lambda.body);
    const indent: string = isSimpleValue(lambda.body.kind)
        ? ` ${body}`
        : (function (y: any) {
              return "\n" + y;
          })(prefixLines(body, 4));
    return `(\\${args} ->${indent})`;
}

function generateLambdaCall(lambdaCall: LambdaCall): string {
    const args: string = (function (y: any) {
        return y.join(", ");
    })(
        List.map(function (arg: any) {
            return `${arg}: any`;
        }, lambdaCall.args)
    );
    const argsValues: string = (function (y: any) {
        return y.join(", ");
    })(List.map(generateExpression, lambdaCall.args));
    const body: string = generateExpression(lambdaCall.lambda.body);
    return `(function(${args}) {\n    return ${body};\n})(${argsValues})`;
}

function generateEquality(equality: Equality): string {
    const left: string = generateExpression(equality.left);
    const right: string = generateExpression(equality.right);
    return `${left} == ${right}`;
}

function generateInEquality(inEquality: InEquality): string {
    const left: string = generateExpression(inEquality.left);
    const right: string = generateExpression(inEquality.right);
    return `${left} != ${right}`;
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

function generateGreaterThanOrEqual(
    greaterThanOrEqual: GreaterThanOrEqual
): string {
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
    return `${left} :: ${right}`;
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

function generateDoExpression(expression: DoExpression): string {
    switch (expression.kind) {
        case "Const": {
            return generateConst(expression);
        }
        case "Function": {
            return generateFunction(expression);
        }
        case "FunctionCall": {
            return generateFunctionCall(expression);
        }
        case "ModuleReference": {
            return generateModuleReference(expression);
        }
        case "IfStatement": {
            return generateIfStatement(expression);
        }
    }
}

function generateDoBlock(doBody: DoBlock): string {
    return (function (y: any) {
        return `do\n${y}\nreturn`;
    })(
        (function (y: any) {
            return prefixLines(y, 4);
        })(
            (function (y: any) {
                return y.join("\n\n");
            })(
                List.map(function (expression: any) {
                    return generateDoExpression(expression);
                }, doBody.expressions)
            )
        )
    );
}

const openParens: string = "(";

const closeParens: string = ")";

function typeToArg(type_: Type): string {
    return (function (y: any) {
        return y.replace(closeParens, "");
    })(
        (function (y: any) {
            return y.replace(openParens, "");
        })(
            (function (y: any) {
                return y.replace(" ", "_");
            })(
                (function (y: any) {
                    return y[0].toLowerCase() + y.slice(1);
                })(generateTopLevelType(type_))
            )
        )
    );
}

function generateFunctionArg(
    knownNames: string[],
    arg: FunctionArgsUnion
): string {
    switch (arg.kind) {
        case "FunctionArg": {
            return arg.name;
        }
        case "AnonFunctionArg": {
            const tempName: string = (function (): any {
                switch (arg.type.kind) {
                    case "FunctionType": {
                        return "fn";
                    }
                    default: {
                        return `${typeToArg(arg.type)}`;
                    }
                }
            })();
            if (knownNames.indexOf(tempName) === -1) {
                return tempName;
            } else {
                return `_${tempName}`;
            }
        }
    }
}

function knownArgNames(args: FunctionArgsUnion[]): string[] {
    switch (args.length) {
        case 0: {
            return [];
        }
        case args.length: {
            if (args.length >= 1) {
                const [arg, ...rest] = args;
                switch (arg.kind) {
                    case "FunctionArg": {
                        return [arg.name, ...knownArgNames(rest)];
                    }
                    case "AnonFunctionArg": {
                        return knownArgNames(rest);
                    }
                }
            }
        }
        default: {
            return [];
        }
    }
}

function generateFunctionArgType(arg: FunctionArgsUnion): string {
    switch (arg.kind) {
        case "FunctionArg": {
            return generateTopLevelType(arg.type);
        }
        case "AnonFunctionArg": {
            return generateTopLevelType(arg.type);
        }
    }
}

function generateFunction(function_: Function): string {
    const argsTypes: string = (function (y: any) {
        return y.join(" -> ");
    })(List.map(generateFunctionArgType, function_.args));
    const knownNames: string[] = knownArgNames(function_.args);
    const args: string = (function (y: any) {
        return y.join(" ");
    })(
        List.map(function (x: any) {
            return generateFunctionArg(knownNames, x);
        }, function_.args)
    );
    const maybeLetBody: string = generateLetBlock(function_.letBody);
    const maybeDoBody: string =
        function_.doBody === null
            ? ""
            : `\n${prefixLines(generateDoBlock(function_.doBody), 4)}`;
    const returnType: string = generateTopLevelType(function_.returnType);
    const bodyIndent: number =
        maybeLetBody === "" && maybeDoBody === "" ? 4 : 8;
    const body: string = (function (y: any) {
        return prefixLines(y, bodyIndent);
    })(generateExpression(function_.body));
    return (function (y: any) {
        return y.join("\n");
    })([
        `${function_.name}: ${argsTypes} -> ${returnType}`,
        `${function_.name} ${args} =${maybeLetBody}${maybeDoBody}`,
        `${body}`,
    ]);
}

function generateConst(constDef: Const): string {
    const maybeLetBody: string = generateLetBlock(constDef.letBody);
    const bodyIndent: number = maybeLetBody === "" ? 4 : 8;
    const body: string = (function (y: any) {
        return prefixLines(y, bodyIndent);
    })(generateExpression(constDef.value));
    const typeDef: string = generateTopLevelType(constDef.type);
    return (function (y: any) {
        return y.join("\n");
    })([
        `${constDef.name}: ${typeDef}`,
        `${constDef.name} =${maybeLetBody}`,
        `${body}`,
    ]);
}

function generateImportModule(module: ImportModule): string {
    const partExposing: string =
        module.exposing.length === 0
            ? ""
            : ` exposing ( ${module.exposing.join(", ")} )`;
    const moduleName: string = (function (): any {
        switch (module.namespace) {
            case "Global": {
                if (module.name.includes("/")) {
                    return `"${module.name}"`;
                } else {
                    return module.name;
                }
            }
            case "Relative": {
                return module.name;
            }
        }
    })();
    switch (module.alias.kind) {
        case "Just": {
            const { value } = module.alias;
            return `import ${moduleName} as ${value}${partExposing}`;
        }
        case "Nothing": {
            return `import ${moduleName}${partExposing}`;
        }
    }
}

function generateImportBlock(imports: Import): string {
    return (function (y: any) {
        return y.join("\n");
    })(List.map(generateImportModule, imports.modules));
}

function generateExportBlock(exports: Export): string {
    return `exposing ( ${exports.names.join(", ")} )`;
}

function generateComment(comment: Comment): string {
    return `-- ${comment.body}`;
}

function generateMultilineComment(comment: MultilineComment): string {
    return `{-\n${comment.body}\n-}`;
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
        case "UnionUntaggedType": {
            return generateUnionUntaggedType(syntax);
        }
        case "TypeAlias": {
            return generateTypeAlias(syntax);
        }
        case "Typeclass": {
            return generateTypeclass(syntax);
        }
        case "Impl": {
            return generateImpl(syntax);
        }
        case "Function": {
            return generateFunction(syntax);
        }
        case "Const": {
            return generateConst(syntax);
        }
        case "Comment": {
            return generateComment(syntax);
        }
        case "MultilineComment": {
            return generateMultilineComment(syntax);
        }
    }
}

function joinBlocks(blocks: Block[]): string {
    switch (blocks.length) {
        case blocks.length: {
            if (blocks.length >= 1) {
                const [block, ...rest] = blocks;
                const generated: string = generateBlock(block);
                const next: string = joinBlocks(rest);
                if (generated.trim().length === 0) {
                    return next;
                } else {
                    switch (block.kind) {
                        case "Comment": {
                            return generated + "\n" + next;
                        }
                        case "MultilineComment": {
                            return generated + "\n" + next;
                        }
                        default: {
                            return generated + "\n\n" + next;
                        }
                    }
                }
            }
        }
        default: {
            return "";
        }
    }
}

function generateDerw(module: Module): string {
    const onlyImports: Import[] = List.filter(function (block: any) {
        return block.kind === "Import";
    }, module.body);
    function sorter(a: string, b: string): number {
        if (a === b) {
            return 0;
        } else {
            if (a < b) {
                return -1;
            } else {
                return 1;
            }
        }
    }
    const sortedImports: string = (function (y: any) {
        return y.join("\n");
    })(
        (function (y: any) {
            return y.sort(sorter);
        })(
            List.filter(
                function (line: any) {
                    return line.length > 0;
                },
                List.map(generateBlock, onlyImports)
            )
        )
    );
    const maybeNewlines: string = onlyImports.length === 0 ? "" : "\n\n";
    const withoutImports: string = (function (y: any) {
        return y.trim();
    })(
        (function (y: any) {
            return joinBlocks(y);
        })(
            List.filter(function (block: any) {
                return block.kind !== "Import";
            }, module.body)
        )
    );
    return (function (y: any) {
        return y.join("");
    })([sortedImports, maybeNewlines, withoutImports]);
}
