import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    LeftPipe,
    ListValue,
    Module,
    ModuleReference,
    StringValue,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
viewList: Model -> HtmlNode Msg
viewList model =
    Html.ul [ ] [ class_ "todo-list" ] (filteredItems model.filterMode model.list |> List.map viewListItem)
`.trim();

const multiLine = `
viewList: Model -> HtmlNode Msg
viewList model =
    Html.ul [ ] [ class_ "todo-list" ] (filteredItems model.filterMode model.list
        |> List.map viewListItem)
`.trim();

const expectedOutput = `
function viewList(model: Model): HtmlNode<Msg> {
    return Html.ul([], [class_("todo-list")], List.map(
        viewListItem,
        filteredItems(model.filterMode, model.list)
    ));
}
`.trim();

const expectedOutputJS = `
function viewList(model) {
    return Html.ul([], [class_("todo-list")], List.map(
        viewListItem,
        filteredItems(model.filterMode, model.list)
    ));
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
                    "viewList",
                    FixedType("HtmlNode", [FixedType("Msg", [])]),
                    [FunctionArg("model", FixedType("Model", []))],
                    [],
                    ModuleReference(
                        ["Html"],
                        FunctionCall("ul", [
                            ListValue([]),
                            ListValue([
                                FunctionCall("class_", [
                                    StringValue("todo-list"),
                                ]),
                            ]),
                            LeftPipe(
                                FunctionCall("filteredItems", [
                                    ModuleReference(
                                        ["model"],
                                        Value("filterMode")
                                    ),
                                    ModuleReference(["model"], Value("list")),
                                ]),
                                ModuleReference(
                                    ["List"],
                                    FunctionCall("map", [Value("viewListItem")])
                                )
                            ),
                        ])
                    )
                ),
            ],
            [
                "Error on lines 0 - 3\n" +
                    "Type HtmlNode (Msg) did not exist in the namespace\n" +
                    "Type Model did not exist in the namespace:\n" +
                    "```\n" +
                    "viewList: Model -> HtmlNode Msg\n" +
                    "viewList model =\n" +
                    '    Html.ul [ ] [ class_ "todo-list" ] (filteredItems model.filterMode model.list |> List.map viewListItem)\n' +
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
                    "viewList",
                    FixedType("HtmlNode", [FixedType("Msg", [])]),
                    [FunctionArg("model", FixedType("Model", []))],
                    [],
                    ModuleReference(
                        ["Html"],
                        FunctionCall("ul", [
                            ListValue([]),
                            ListValue([
                                FunctionCall("class_", [
                                    StringValue("todo-list"),
                                ]),
                            ]),
                            LeftPipe(
                                FunctionCall("filteredItems", [
                                    ModuleReference(
                                        ["model"],
                                        Value("filterMode")
                                    ),
                                    ModuleReference(["model"], Value("list")),
                                ]),
                                ModuleReference(
                                    ["List"],
                                    FunctionCall("map", [Value("viewListItem")])
                                )
                            ),
                        ])
                    )
                ),
            ],
            [
                "Error on lines 0 - 4\n" +
                    "Type HtmlNode (Msg) did not exist in the namespace\n" +
                    "Type Model did not exist in the namespace:\n" +
                    "```\n" +
                    "viewList: Model -> HtmlNode Msg\n" +
                    "viewList model =\n" +
                    '    Html.ul [ ] [ class_ "todo-list" ] (filteredItems model.filterMode model.list\n' +
                    "        |> List.map viewListItem)\n" +
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
    const parsed = parse(oneLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}

export function testGenerateDerwMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, multiLine);
}
