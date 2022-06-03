module Examples.advent_of_code.day_2.part_1 exposing (..)

import fs

import globalThis exposing ( Buffer )

type alias Boat = {
    horizontal: Float,
    depth: Float
}

forward: Float -> Boat -> Boat
forward x boat =
    {
        horizontal = x + boat.horizontal,
        depth = boat.depth
    }

up: Float -> Boat -> Boat
up y boat =
    {
        horizontal = boat.horizontal,
        depth = boat.depth - y
    }

down: Float -> Boat -> Boat
down y boat =
    {
        horizontal = boat.horizontal,
        depth = boat.depth + y
    }

getMulti: Boat -> Float
getMulti boat =
    boat.horizontal * boat.depth

run: Boat -> Command -> Boat
run boat command =
    if command.command == "forward" then
        forward command.amount boat
    else
        if command.command == "up" then
            up command.amount boat
        else
            down command.amount boat

runAll: List Command -> Boat
runAll commands =
    commands.reduce run {
        horizontal = 0,
        depth = 0
    }

type alias Command = {
    command: String,
    amount: Float
}

parseLine: String -> Command
parseLine str =
    let
        piece: List String
        piece =
            str.split " "

        left: String
        left =
            piece[0]

        right: Float
        right =
            globalThis.parseInt piece[1]
    in
        {
            command = left,
            amount = right
        }

parseLines: List String -> List Command
parseLines lines =
    lines.map parseLine

exampleMain: String
exampleMain =
    [
        "forward 5",
        "down 5",
        "forward 8",
        "up 3",
        "down 8",
        "forward 2"
    ]
        |> parseLines
        |> runAll
        |> globalThis.console.log

adventInput: List Command
adventInput =
    fs.readFileSync "input.txt"
        |> toString
        |> split
        |> parseLines

split: String -> List String
split file =
    file.split "\n"

toString: Buffer -> String
toString buffer =
    buffer.toString

main: String
main =
    adventInput
        |> runAll
        |> globalThis.console.log
