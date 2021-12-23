module Main exposing (..)

type Animal =
    Dog { name: String }
    | Cat { lives: Float }

sayHiToPet: Animal -> String
sayHiToPet pet =
    case pet of
        Dog { name } ->
            "Good boy ${name}!"
        Cat { lives } ->
            "You have " ++ lives ++ " lives remaining."

main: String
main =
    Dog { name = "roof" } 
        |> sayHiToPet
        |> Debug.log ""
