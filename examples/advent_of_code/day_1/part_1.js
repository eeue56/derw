import fs from "fs";

function Iteration(args) {
    return {
        ...args,
    };
}

function isIncrease(x, y) {
    return x < y;
}

function countHelper(count, x) {
    if (isIncrease(count.value, x)) {
        return {
            value: x,
            count: count.count + 1
        };
    } else {
        return {
            value: x,
            count: count.count
        };
    }
}

function getCount(iteration) {
    return iteration.count;
}

function countIncreases(xs) {
    return getCount(xs.reduce(countHelper, {
        value: 9999,
        count: 0
    }));
}

const adventInput = toNumbers(split(toString(fs.readFileSync("input.txt"))));

function toInt(str) {
    return parseInt(str, 10);
}

function toNumbers(list) {
    return list.map(toInt);
}

function split(file) {
    return file.split("\n");
}

function toString(buffer) {
    return buffer.toString();
}

const exampleMain = console.log(countIncreases([ 199, 200, 208, 210, 200, 207, 240, 269, 260, 263 ]));

const main = console.log(countIncreases(adventInput));
