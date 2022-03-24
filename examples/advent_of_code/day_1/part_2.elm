module Main exposing (..)

import fs

import globalThis exposing ( Buffer )

type alias Iteration = {
    a: Float,
    b: Float,
    c: Float,
    value: Float,
    count: Float
}

isIncrease: Float -> Float -> Bool
isIncrease x y =
    x < y

sumIteration: Iteration -> Float
sumIteration iteration =
    iteration.a + iteration.b + iteration.c

countHelper: Iteration -> Float -> Iteration
countHelper count x =
    let
        sumCurrent: Float
        sumCurrent =
            sumIteration count

        sumNext: Float
        sumNext =
            count.b + count.c + x
    in
        if count.a == 9999 then
            {
                a = x,
                b = count.b,
                c = count.c,
                value = x,
                count = count.count
            }
        else
            if count.b == 9999 then
                {
                    a = count.a,
                    b = x,
                    c = count.c,
                    value = x,
                    count = count.count
                }
            else
                if count.c == 9999 then
                    {
                        a = count.a,
                        b = x,
                        c = x,
                        value = x,
                        count = count.count
                    }
                else
                    if isIncrease sumCurrent sumNext then
                        {
                            a = count.b,
                            b = count.c,
                            c = x,
                            value = x,
                            count = count.count + 1
                        }
                    else
                        {
                            a = count.b,
                            b = count.c,
                            c = x,
                            value = x,
                            count = count.count
                        }

getCount: Iteration -> Float
getCount iteration =
    iteration.count

countIncreases: List Float -> Float
countIncreases xs =
    xs.reduce countHelper {
        a = 9999,
        b = 9999,
        c = 9999,
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
    globalThis.parseInt str 10

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
        |> globalThis.console.log
