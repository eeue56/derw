import * as assert from "@eeue56/ts-assert";
import { generateDerw } from "../generators/derw";
import { parse } from "../parser";

export function testBase() {
    const str = `
hello: string
hello =
    List.map banana orange
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}

export function testFunctionCall() {
    const str = `
hello: string
hello =
    List.map banana (fn orange)
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}

export function testMultipleFunctionCalls() {
    const str = `
hello: string
hello =
    List.map banana (fn orange) (fn fruit)
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}

export function testModuleReference() {
    const str = `
hello: string
hello =
    List.map banana (Other.fn orange)
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}

export function testMultipleModuleReferences() {
    const str = `
hello: string
hello =
    List.map banana (Other.fn orange) (Other.fn fruit)
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}

export function testConstructor() {
    const str = `
hello: string
hello =
    something (Just { value: 5 })
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}

export function testMultipleConstructor() {
    const str = `
hello: string
hello =
    something (Just { value: 5 }) Nothing
    `.trim();

    const parsed = parse(str);
    const generated = generateDerw(parsed);

    assert.deepStrictEqual(generated, str);
}
