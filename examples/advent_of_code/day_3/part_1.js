import * as fs from "fs";

function Common(args) {
    return {
        ...args,
    };
}

function reducer(index, common, line) {
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

function mostCommon(index, bits) {
    function something(x, y) {
        return reducer(index, x, y);
    }
    return bits.reduce(something, {
        zero: 0,
        one: 0
    });
}

function commonBits(xs) {
    function truthy(str) {
        return true;
    }
    const firstElement = xs.find(truthy);
    const length = (function(x) {
        return x.length;
    })(firstElement);
    const lengthMinusOne = length - 1;
    function commoner(x) {
        return mostCommon(x, xs);
    }
    return (function(x) {
        return x.map(commoner);
    })(Array.from({ length: lengthMinusOne - 0 + 1 }, (_ReservedX, _ReservedI) => _ReservedI + 0));
}

function gammaToString(common) {
    if (common.zero > common.one) {
        return "0";
    } else {
        return "1";
    }
}

function epsilonToString(common) {
    if (common.zero > common.one) {
        return "1";
    } else {
        return "0";
    }
}

function getNumber(str) {
    return parseInt(str, 2);
}

function allGammaToString(xs) {
    return xs.map(gammaToString);
}

function allEpsilonToString(xs) {
    return xs.map(epsilonToString);
}

function join(str) {
    return str.join("");
}

function calc(xs) {
    const common = commonBits(xs);
    const gamma = getNumber(join(allGammaToString(common)));
    const epsilon = getNumber(join(allEpsilonToString(common)));
    const nothing = globalThis.console.log(gamma);
    return gamma * epsilon;
}

const exampleMain = globalThis.console.log(calc([ "00100", "11110", "10110", "10111", "10101", "01111", "00111", "11100", "10000", "11001", "00010", "01010" ]));

const adventInput = split(toString(fs.readFileSync("input.txt")));

function split(file) {
    return file.split("\n");
}

function toString(buffer) {
    return buffer.toString();
}

const main = globalThis.console.log(calc(adventInput));
