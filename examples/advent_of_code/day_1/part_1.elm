module Main exposing (..)

import fs

type alias Iteration = {
    value: Float,
    count: Float
}

isIncrease: Float -> Float -> Bool
isIncrease x y =
    x < y

countHelper: Iteration -> Float -> Iteration
countHelper count x =
    if isIncrease count.value x then
        {
            value = x,
            count = count.count + 1
        }
    else
        {
            value = x,
            count = count.count
        }

getCount: Iteration -> Float
getCount iteration =
    iteration.count

countIncreases: List Float -> Float
countIncreases xs =
    xs.reduce countHelper {
        value = 9999,
        count = 0
    }
        |> getCount

adventInput: List Float
adventInput =
    fs.readFileSync "input.txt"
        |> toString
        |> split
        |> toNumbers

toInt: String -> Float
toInt str =
    parseInt str 10

toNumbers: List String -> List Float
toNumbers list =
    list.map toInt

split: String -> List String
split file =
    file.split "\n"

toString: Buffer -> String
toString buffer =
    buffer.toString

exampleMain: String
exampleMain =
    countIncreases [
        199,
        200,
        208,
        210,
        200,
        207,
        240,
        269,
        260,
        263
    ]
        |> Debug.log ""

main: String
main =
    countIncreases adventInput
        |> Debug.log ""
