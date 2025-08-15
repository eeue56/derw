import * as fs from "fs";

function Boat(args) {
    return {
        ...args,
    };
}

function forward(x, boat) {
    return {
        horizontal: x + boat.horizontal,
        depth: boat.depth,
    };
}

function up(y, boat) {
    return {
        horizontal: boat.horizontal,
        depth: boat.depth - y,
    };
}

function down(y, boat) {
    return {
        horizontal: boat.horizontal,
        depth: boat.depth + y,
    };
}

function getMulti(boat) {
    return boat.horizontal * boat.depth;
}

function run(boat, command) {
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

function runAll(commands) {
    return commands.reduce(run, {
        horizontal: 0,
        depth: 0,
    });
}

function Command(args) {
    return {
        ...args,
    };
}

function parseLine(str) {
    const piece = str.split(" ");
    const left = piece[0];
    const right = globalThis.parseInt(piece[1]);
    return {
        command: left,
        amount: right,
    };
}

function parseLines(lines) {
    return lines.map(parseLine);
}

const exampleMain = globalThis.console.log(runAll(parseLines(
    ["forward 5", "down 5", "forward 8", "up 3", "down 8", "forward 2"]
)));

const adventInput = parseLines(split(toString(fs.readFileSync("input.txt"))));

function split(file) {
    return file.split("\n");
}

function toString(buffer) {
    return buffer.toString();
}

const main = globalThis.console.log(runAll(adventInput));
