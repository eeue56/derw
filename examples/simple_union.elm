module Examples.simple_union exposing (..)

type Binary =
    One
    | Zero

isTruthy: Binary -> Bool
isTruthy binary =
    case binary of
        One ->
            True

        Zero ->
            False
