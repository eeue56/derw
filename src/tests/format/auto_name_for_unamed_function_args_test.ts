import * as assert from "@eeue56/ts-assert";
import { generateDerw } from "../../generators/Derw";
import { parse } from "../../parser";

export function testArgumentsArePreserved() {
    const input = `
fn: number -> number -> number
fn a b =
    a + b
    `.trim();

    const expected = `
fn: number -> number -> number
fn a b =
    a + b
    `.trim();

    const parsed = parse(input);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, expected);
}

export function testArgumentsAreAddedWhenMissing() {
    const input = `
fn: number -> Context -> number
fn a =
    a + b
    `.trim();

    const expected = `
fn: number -> Context -> number
fn a context =
    a + b
    `.trim();

    const parsed = parse(input);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, expected);
}

export function testArgumentsAreAddedWhenMissingWithParens() {
    const input = `
fn: number -> Maybe string -> number
fn a =
    a + b
    `.trim();

    const expected = `
fn: number -> Maybe string -> number
fn a maybe_string =
    a + b
    `.trim();

    const parsed = parse(input);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, expected);
}

export function testArgumentsAreAddedForFunctions() {
    const input = `
fn: number -> (a -> b) -> number
fn a =
    a + b
    `.trim();

    const expected = `
fn: number -> (a -> b) -> number
fn a fn =
    a + b
    `.trim();

    const parsed = parse(input);
    const generated = generateDerw(parsed);
    assert.strictEqual(generated, expected);
}
