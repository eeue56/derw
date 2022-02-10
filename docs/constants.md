# Constants

Constants are the foundation of code: they are immutable values which remain with the same name and value. Constants can be assigned values from literals or a function call.

## Literals

```derw
helloMessage: string
helloMessage =
    "Hello reader!"

myAge: number
myAge =
    28

twoAges: number
twoAges =
    28 + 29

type Person = {
    name: string,
    age: number
}

me: Person
me =
    { name: "Noah", age: myAge }

guests: List string
guests =
    [ "Dave", "James", "Harry" ]

scores: List number
scores =
    [ 99, 100, 57 ]
```

## Functions

```derw
scoreAverage: number
scoreAverage =
    [ 99, 100, 57 ]
        |> List.foldl (\x xs -> x + xs)
        |> (\x -> x / 3)
```