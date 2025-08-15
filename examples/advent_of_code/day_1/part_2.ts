import * as fs from "fs";

type Iteration = {
    a: number;
    b: number;
    c: number;
    value: number;
    count: number;
};

function Iteration(args: { a: number; b: number; c: number; value: number; count: number; }): Iteration {
    return {
        ...args,
    };
}

function isIncrease(x: number, y: number): boolean {
    return x < y;
}

function sumIteration(iteration: Iteration): number {
    return iteration.a + iteration.b + iteration.c;
}

function countHelper(count: Iteration, x: number): Iteration {
    const sumCurrent: number = sumIteration(count);
    const sumNext: number = count.b + count.c + x;
    if (count.a === 9999) {
        return {
            a: x,
            b: count.b,
            c: count.c,
            value: x,
            count: count.count,
        };
    } else {
        if (count.b === 9999) {
            return {
                a: count.a,
                b: x,
                c: count.c,
                value: x,
                count: count.count,
            };
        } else {
            if (count.c === 9999) {
                return {
                    a: count.a,
                    b: x,
                    c: x,
                    value: x,
                    count: count.count,
                };
            } else {
                if (isIncrease(sumCurrent, sumNext)) {
                    return {
                        a: count.b,
                        b: count.c,
                        c: x,
                        value: x,
                        count: count.count + 1,
                    };
                } else {
                    return {
                        a: count.b,
                        b: count.c,
                        c: x,
                        value: x,
                        count: count.count,
                    };
                };
            };
        };
    }
}

function getCount(iteration: Iteration): number {
    return iteration.count;
}

function countIncreases(xs: number[]): number {
    return getCount(xs.reduce(countHelper, {
        a: 9999,
        b: 9999,
        c: 9999,
        value: 9999,
        count: 0,
    }));
}

const adventInput: number[] = toNumbers(split(toString(fs.readFileSync("input.txt"))));

function toInt(str: string): number {
    return globalThis.parseInt(str, 10);
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

const exampleMain: void = console.log(countIncreases(
    [199, 200, 208, 210, 200, 207, 240, 269, 260, 263]
));

const main: void = globalThis.console.log(countIncreases(adventInput));
