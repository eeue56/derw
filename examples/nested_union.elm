module Examples.nested_union exposing (..)

type Maybe a =
    Just { value: a }
    | nothing

something: Maybe String -> Maybe String
something x =
    x

other: List (Maybe Binary)
other =
    [ ]
