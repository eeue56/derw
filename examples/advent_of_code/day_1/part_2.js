import * as fs from "fs";

function Iteration(args) {
    return {
        ...args,
    };
}

function isIncrease(x, y) {
    return x < y;
}

function sumIteration(iteration) {
    return iteration.a + iteration.b + iteration.c;
}

function countHelper(count, x) {
    const sumCurrent = sumIteration(count);
    const sumNext = count.b + count.c + x;
    if (count.a === 9999) {
        return {
            a: x,
            b: count.b,
            c: count.c,
            value: x,
            count: count.count
        };
    } else {
        if (count.b === 9999) {
            return {
                a: count.a,
                b: x,
                c: count.c,
                value: x,
                count: count.count
            };
        } else {
            if (count.c === 9999) {
                return {
                    a: count.a,
                    b: x,
                    c: x,
                    value: x,
                    count: count.count
                };
            } else {
                if (isIncrease(sumCurrent, sumNext)) {
                    return {
                        a: count.b,
                        b: count.c,
                        c: x,
                        value: x,
                        count: count.count + 1
                    };
                } else {
                    return {
                        a: count.b,
                        b: count.c,
                        c: x,
                        value: x,
                        count: count.count
                    };
                };
            };
        };
    }
}

function getCount(iteration) {
    return iteration.count;
}

function countIncreases(xs) {
    return getCount(xs.reduce(countHelper, {
        a: 9999,
        b: 9999,
        c: 9999,
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
