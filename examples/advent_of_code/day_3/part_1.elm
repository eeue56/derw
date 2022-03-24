module Main exposing (..)

import fs

import globalThis exposing ( Buffer )

type alias Common = {
    zero: Float,
    one: Float
}

reducer: Float -> Common -> String -> Common
reducer index common line =
    if line.charAt index == "0" then
        {
            zero = common.zero + 1,
            one = common.one
        }
    else
        {
            zero = common.zero,
            one = common.one + 1
        }

mostCommon: Float -> List String -> Common
mostCommon index bits =
    let
        something: Common -> String -> Common
        something x y =
            reducer index x y
    in
        bits.reduce something {
            zero = 0,
            one = 0
        }

commonBits: List String -> List Common
commonBits xs =
    let
        truthy: String -> Bool
        truthy str =
            True

        firstElement: any
        firstElement =
            xs.find truthy

        length: Float
        length =
            firstElement
                |> \x -> x.length

        lengthMinusOne: Float
        lengthMinusOne =
            length - 1

        commoner: Float -> Common
        commoner x =
            mostCommon x xs
    in
        [ 0..lengthMinusOne ]
            |> \x -> x.map commoner

gammaToString: Common -> String
gammaToString common =
    if common.zero > common.one then
        "0"
    else
        "1"

epsilonToString: Common -> String
epsilonToString common =
    if common.zero > common.one then
        "1"
    else
        "0"

getNumber: String -> Float
getNumber str =
    parseInt str 2

allGammaToString: List Common -> List String
allGammaToString xs =
    xs.map gammaToString

allEpsilonToString: List Common -> List String
allEpsilonToString xs =
    xs.map epsilonToString

join: List String -> String
join str =
    str.join ""

calc: List String -> Float
calc xs =
    let
        common: List Common
        common =
            commonBits xs

        gamma: Float
        gamma =
            allGammaToString common
                |> join
                |> getNumber

        epsilon: Float
        epsilon =
            allEpsilonToString common
                |> join
                |> getNumber

        nothing: String
        nothing =
            globalThis.console.log gamma
    in
        gamma * epsilon

exampleMain: String
exampleMain =
    [
        "00100",
        "11110",
        "10110",
        "10111",
        "10101",
        "01111",
        "00111",
        "11100",
        "10000",
        "11001",
        "00010",
        "01010"
    ]
        |> calc
        |> globalThis.console.log

adventInput: List String
adventInput =
    fs.readFileSync "input.txt"
        |> toString
        |> split

split: String -> List String
split file =
    file.split "\n"

toString: Buffer -> String
toString buffer =
    buffer.toString

main: String
main =
    adventInput
        |> calc
        |> globalThis.console.log
