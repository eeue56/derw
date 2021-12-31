import * as fs from "fs";

type Iteration = {
    value: number;
    count: number;
}

function Iteration(args: { value: number, count: number }): Iteration {
    return {
        ...args,
    };
}

function isIncrease(x: number, y: number): boolean {
    return x < y;
}

function countHelper(count: Iteration, x: number): Iteration {
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

function getCount(iteration: Iteration): number {
    return iteration.count;
}

function countIncreases(xs: number[]): number {
    return getCount(xs.reduce(countHelper, {
        value: 9999,
        count: 0
    }));
}

const adventInput: number[] = toNumbers(split(toString(fs.readFileSync("input.txt"))));

function toInt(str: string): number {
    return parseInt(str, 10);
}

function toNumbers(list: string[]): number[] {
    return list.map(toInt);
}

function split(file: string): string[] {
    return file.split("\n");
}

function toString(buffer: Buffer): string {
    return buffer.toString();
}

const exampleMain: void = console.log(countIncreases([ 199, 200, 208, 210, 200, 207, 240, 269, 260, 263 ]));

const main: void = console.log(countIncreases(adventInput));
