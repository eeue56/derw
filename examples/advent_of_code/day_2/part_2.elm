module Main exposing (..)

import fs

type alias Boat = {
    horizontal: Float,
    depth: Float,
    aim: Float
}

forward: Float -> Boat -> Boat
forward x boat =
    let
        multi: Float
        multi =
            x * boat.aim
    in
        {
            horizontal = x + boat.horizontal,
            depth = boat.depth + multi,
            aim = boat.aim
        }

up: Float -> Boat -> Boat
up y boat =
    {
        horizontal = boat.horizontal,
        depth = boat.depth,
        aim = boat.aim - y
    }

down: Float -> Boat -> Boat
down y boat =
    {
        horizontal = boat.horizontal,
        depth = boat.depth,
        aim = boat.aim + y
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
        depth = 0,
        aim = 0
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
            parseInt piece[1]
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
        |> Debug.log ""

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
        |> getMulti
        |> Debug.log ""
