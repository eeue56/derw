import * as fs from "fs";

type Boat = {
    horizontal: number;
    depth: number;
}

function Boat(args: { horizontal: number, depth: number }): Boat {
    return {
        ...args,
    };
}

function forward(x: number, boat: Boat): Boat {
    return {
        horizontal: x + boat.horizontal,
        depth: boat.depth
    };
}

function up(y: number, boat: Boat): Boat {
    return {
        horizontal: boat.horizontal,
        depth: boat.depth - y
    };
}

function down(y: number, boat: Boat): Boat {
    return {
        horizontal: boat.horizontal,
        depth: boat.depth + y
    };
}

function getMulti(boat: Boat): number {
    return boat.horizontal * boat.depth;
}

function run(boat: Boat, command: Command): Boat {
    if (command.command === "forward") {
        return forward(command.amount, boat);
    } else {
        if (command.command === "up") {
            return up(command.amount, boat);
        } else {
            return down(command.amount, boat);
        };
    }
}

function runAll(commands: Command[]): Boat {
    return commands.reduce(run, {
        horizontal: 0,
        depth: 0
    });
}

type Command = {
    command: string;
    amount: number;
}

function Command(args: { command: string, amount: number }): Command {
    return {
        ...args,
    };
}

function parseLine(str: string): Command {
    const piece: string[] = str.split(" ");
    const left: string = piece[0];
    const right: number = globalThis.parseInt(piece[1]);
    return {
        command: left,
        amount: right
    };
}

function parseLines(lines: string[]): Command[] {
    return lines.map(parseLine);
}

const exampleMain: void = globalThis.console.log(runAll(parseLines([ "forward 5", "down 5", "forward 8", "up 3", "down 8", "forward 2" ])));

const adventInput: Command[] = parseLines(split(toString(fs.readFileSync("input.txt"))));

function split(file: string): string[] {
    return file.split("\n");
}

function toString(buffer: Buffer): string {
    return buffer.toString();
}

const main: void = globalThis.console.log(runAll(adventInput));
