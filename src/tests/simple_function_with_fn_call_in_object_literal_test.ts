import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../Blocks";
import { compileTypescript } from "../compile";
import { generateDerw } from "../generators/Derw";
import { generateJavascript } from "../generators/Js";
import { generateTypescript } from "../generators/Ts";
import { parse } from "../parser";
import {
    Field,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    Lambda,
    Module,
    ModuleReference,
    ObjectLiteral,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
hello: List Location -> List LocationWithDistance
hello locations =
    List.map (\\location -> {
        name: fn location { lat: location.lat, lon: location.lon }
    }) locations
`.trim();

const expectedOutput = `
function hello(locations: Location[]): LocationWithDistance[] {
    return List.map(function(location: any) {
        return { name: fn(location, {
        lat: location.lat,
        lon: location.lon
    }) };
    }, locations);
}
`.trim();

const expectedOutputJS = `
function hello(locations) {
    return List.map(function(location) {
        return { name: fn(location, {
        lat: location.lat,
        lon: location.lon
    }) };
    }, locations);
}
`.trim();

const multiLine = `
hello: List Location -> List LocationWithDistance
hello locations =
    List.map (\\location -> { name: fn location {
        lat: location.lat,
        lon: location.lon
    } }) locations
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
    // console.log(JSON.stringify(parse(oneLine).body, null, 4));
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "hello",
                    FixedType("List", [
                        FixedType("LocationWithDistance", [ ]),
                    ]),
                    [
                        FunctionArg(
                            "locations",
                            FixedType("List", [ FixedType("Location", [ ]) ])
                        ),
                    ],
                    [ ],
                    ModuleReference(
                        [ "List" ],
                        FunctionCall("map", [
                            Lambda(
                                [ "location" ],
                                ObjectLiteral(null, [
                                    Field(
                                        "name",
                                        FunctionCall("fn", [
                                            Value("location"),
                                            ObjectLiteral(null, [
                                                Field(
                                                    "lat",
                                                    ModuleReference(
                                                        [ "location" ],
                                                        Value("lat")
                                                    )
                                                ),
                                                Field(
                                                    "lon",
                                                    ModuleReference(
                                                        [ "location" ],
                                                        Value("lon")
                                                    )
                                                ),
                                            ]),
                                        ])
                                    ),
                                ])
                            ),
                            Value("locations"),
                        ])
                    )
                ),
            ],
            [ ]
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
                    "hello",
                    FixedType("List", [
                        FixedType("LocationWithDistance", [ ]),
                    ]),
                    [
                        FunctionArg(
                            "locations",
                            FixedType("List", [ FixedType("Location", [ ]) ])
                        ),
                    ],
                    [ ],
                    ModuleReference(
                        [ "List" ],
                        FunctionCall("map", [
                            Lambda(
                                [ "location" ],
                                ObjectLiteral(null, [
                                    Field(
                                        "name",
                                        FunctionCall("fn", [
                                            Value("location"),
                                            ObjectLiteral(null, [
                                                Field(
                                                    "lat",
                                                    ModuleReference(
                                                        [ "location" ],
                                                        Value("lat")
                                                    )
                                                ),
                                                Field(
                                                    "lon",
                                                    ModuleReference(
                                                        [ "location" ],
                                                        Value("lon")
                                                    )
                                                ),
                                            ]),
                                        ])
                                    ),
                                ])
                            ),
                            Value("locations"),
                        ])
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
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
