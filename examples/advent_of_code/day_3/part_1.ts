import * as fs from "fs";

type Common = {
    zero: number;
    one: number;
}

function Common(args: { zero: number, one: number }): Common {
    return {
        ...args,
    };
}

function reducer(index: number, common: Common, line: string): Common {
    if (line.charAt(index) === "0") {
        return {
            zero: common.zero + 1,
            one: common.one
        };
    } else {
        return {
            zero: common.zero,
            one: common.one + 1
        };
    }
}

function mostCommon(index: number, bits: string[]): Common {
    function something(x: Common, y: string): Common {
        return reducer(index, x, y);
    }
    return bits.reduce(something, {
        zero: 0,
        one: 0
    });
}

function commonBits(xs: string[]): Common[] {
    function truthy(str: string): boolean {
        return true;
    }
    const firstElement: any = xs.find(truthy);
    const length: number = (function(x: any) {
        return x.length;
    })(firstElement);
    const lengthMinusOne: number = length - 1;
    function commoner(x: number): Common {
        return mostCommon(x, xs);
    }
    return (function(x: any) {
        return x.map(commoner);
    })(Array.from({ length: lengthMinusOne - 0 + 1 }, (_ReservedX, _ReservedI) => _ReservedI + 0));
}

function gammaToString(common: Common): string {
    if (common.zero > common.one) {
        return "0";
    } else {
        return "1";
    }
}

function epsilonToString(common: Common): string {
    if (common.zero > common.one) {
        return "1";
    } else {
        return "0";
    }
}

function getNumber(str: string): number {
    return parseInt(str, 2);
}

function allGammaToString(xs: Common[]): string[] {
    return xs.map(gammaToString);
}

function allEpsilonToString(xs: Common[]): string[] {
    return xs.map(epsilonToString);
}

function join(str: string[]): string {
    return str.join("");
}

function calc(xs: string[]): number {
    const common: Common[] = commonBits(xs);
    const gamma: number = getNumber(join(allGammaToString(common)));
    const epsilon: number = getNumber(join(allEpsilonToString(common)));
    const nothing: void = globalThis.console.log(gamma);
    return gamma * epsilon;
}

const exampleMain: void = globalThis.console.log(calc([ "00100", "11110", "10110", "10111", "10101", "01111", "00111", "11100", "10000", "11001", "00010", "01010" ]));

const adventInput: string[] = split(toString(fs.readFileSync("input.txt")));

function split(file: string): string[] {
    return file.split("\n");
}

function toString(buffer: Buffer): string {
    return buffer.toString();
}

const main: void = globalThis.console.log(calc(adventInput));
