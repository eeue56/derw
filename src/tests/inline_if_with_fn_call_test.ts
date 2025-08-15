import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Equality,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    IfStatement,
    ListValue,
    Module,
    ModuleReference,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
view: Model -> HtmlNode Msg
view model =
    Html.section [ ] [ class_ "todoapp" ] [
        viewHeader model,
        viewMain model,
        if model.items.length == 0 then
            text ""
        else
            viewFooter model
    ]
`.trim();

const multiLine = `
view: Model -> HtmlNode Msg
view model =
    Html.section [ ] [ class_ "todoapp" ] [
        viewHeader model,
        viewMain model,
        if model.items.length == 0 then
            text ""
        else
            viewFooter model
    ]
`.trim();

const expectedOutput = `
function view(model: Model): HtmlNode<Msg> {
    return Html.section(
        [],
        [class_("todoapp")],
        [viewHeader(model), viewMain(model), model.items.length === 0 ? text("") : viewFooter(model)]
    );
}
`.trim();

const expectedOutputJS = `
function view(model) {
    return Html.section(
        [],
        [class_("todoapp")],
        [viewHeader(model), viewMain(model), model.items.length === 0 ? text("") : viewFooter(model)]
    );
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "view",
                    FixedType("HtmlNode", [FixedType("Msg", [])]),
                    [FunctionArg("model", FixedType("Model", []))],
                    [],
                    ModuleReference(
                        ["Html"],
                        FunctionCall("section", [
                            ListValue([]),
                            ListValue([
                                FunctionCall("class_", [
                                    StringValue("todoapp"),
                                ]),
                            ]),
                            ListValue([
                                FunctionCall("viewHeader", [Value("model")]),
                                FunctionCall("viewMain", [Value("model")]),
                                IfStatement(
                                    Equality(
                                        ModuleReference(
                                            ["model", "items"],
                                            Value("length")
                                        ),
                                        Value("0")
                                    ),
                                    FunctionCall("text", [StringValue("")]),
                                    [],
                                    [],
                                    FunctionCall("viewFooter", [
                                        Value("model"),
                                    ]),
                                    []
                                ),
                            ]),
                        ])
                    )
                ),
            ],
            [
                "Error on lines 0 - 10\n" +
                    "Type HtmlNode (Msg) did not exist in the namespace\n" +
                    "Type Model did not exist in the namespace:\n" +
                    "```\n" +
                    "view: Model -> HtmlNode Msg\n" +
                    "view model =\n" +
                    '    Html.section [ ] [ class_ "todoapp" ] [\n' +
                    "        viewHeader model,\n" +
                    "        viewMain model,\n" +
                    "        if model.items.length == 0 then\n" +
                    '            text ""\n' +
                    "        else\n" +
                    "            viewFooter model\n" +
                    "    ]\n" +
                    "```",
            ]
        )
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Function(
                    "view",
                    FixedType("HtmlNode", [FixedType("Msg", [])]),
                    [FunctionArg("model", FixedType("Model", []))],
                    [],
                    ModuleReference(
                        ["Html"],
                        FunctionCall("section", [
                            ListValue([]),
                            ListValue([
                                FunctionCall("class_", [
                                    StringValue("todoapp"),
                                ]),
                            ]),
                            ListValue([
                                FunctionCall("viewHeader", [Value("model")]),
                                FunctionCall("viewMain", [Value("model")]),
                                IfStatement(
                                    Equality(
                                        ModuleReference(
                                            ["model", "items"],
                                            Value("length")
                                        ),
                                        Value("0")
                                    ),
                                    FunctionCall("text", [StringValue("")]),
                                    [],
                                    [],
                                    FunctionCall("viewFooter", [
                                        Value("model"),
                                    ]),
                                    []
                                ),
                            ]),
                        ])
                    )
                ),
            ],
            [
                "Error on lines 0 - 10\n" +
                    "Type HtmlNode (Msg) did not exist in the namespace\n" +
                    "Type Model did not exist in the namespace:\n" +
                    "```\n" +
                    "view: Model -> HtmlNode Msg\n" +
                    "view model =\n" +
                    '    Html.section [ ] [ class_ "todoapp" ] [\n' +
                    "        viewHeader model,\n" +
                    "        viewMain model,\n" +
                    "        if model.items.length == 0 then\n" +
                    '            text ""\n' +
                    "        else\n" +
                    "            viewFooter model\n" +
                    "    ]\n" +
                    "```",
            ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateOneLine() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testCompile() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "Ok",
        (compiled.kind === "Err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "Ok",
        (compiled.kind === "Err" && compiled.error.toString()) || ""
    );
}

export function testGenerateJS() {
    const parsed = parse(multiLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateOneLineJS() {
    const parsed = parse(oneLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateDerw() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
