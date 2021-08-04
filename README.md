# derw

An Elm-inspired language that transpiles to TypeScript

# Example

You can find a bunch of examples in [examples](./examples), along with the Typescript they generate. But the general gist is: Elm-compatible syntax where possible.

```elm
type Result a b
    = Err { error: a }
    | Ok { value: b }

asIs : Result a b -> Result a b
asIs result =
    case result of
        Err { error } -> Err { error }
        Ok { value } -> Ok { value }
```

# Roadmap

## 0.0.1 alpha

-   [x] Arrays `[ ]`, `[ 1, 2, 3 ]`, `[ [ 1, 2, 3 ], [ 3, 2, 1 ] ]`
-   [x] Booleans `true`, `false`
-   [x] Strings `""`, `"hello world"`
-   [x] Format strings ` `` `, `` `Hello ${name}` ``
-   [x] Numbers `-1`, `0`, `1`, `-1.1`, `1.1`
-   [x] Addition `1 + 2`, `"Hello" + name`
-   [x] Subtraction `2 - 1`
-   [x] Multiplication `2 * 1`
-   [x] Division `2 / 1`
-   [x] Pipe `[1, 2, 3] |> List.fold add`, `List.fold add <| [1, 2, 3]`
-   [ ] Compose `>>`, `<<`
-   [x] Constants `hello = "hello world"`
-   [x] Function definitions

```elm
add : number -> number -> number
add x y = x + y
```

-   [x] Function calls

```elm
three = add 1 2
```

-   [x] Module references

```elm
three = List.map identity [ 1, 2, 3 ]
```

-   [x] Union types

```elm
type Result a b
    = Err { error: a }
    | Ok { value: b }
```

-   [x] Type variables

```
type Thing a = Thing a
```

-   [ ] Type aliases

```elm
type User =
    { name: string }
```

-   [ ] Imports

```elm
import Result exposing (map)
```

-   [ ] Exports

```elm
module Result exposing (map)
```

-   [ ] Let statements

```elm
sayHiTo : User -> string
sayHiTo user =
    let
        name = user.name
    in
        "Hello " + name

sayHelloTo : User -> string
sayHelloTo user =
    let
        getName: User -> string
        getName user = user.name
    in
        "Hello" + getName user
```

-   [x] If statements

```elm
type Animal = Animal { age: number }
sayHiTo : Animal -> string
sayHiTo animal =
    if animal.age == 1 of
        "Hello little one!"
    else
        "You're old"
```

-   [x] Case..of

```elm
type Animal = Dog | Cat
sayHiTo : Animal -> string
sayHiTo animal =
    case animal of
        Dog -> "Hi dog!"
        Cat -> "Hi cat!"
```

-   [x] Destructing in case..of

```elm
type User = User { name: string }

sayHiTo : User -> string
sayHiTo user =
    case user of
        User { name } -> "Hi " + name + !"
```

-   [x] Constructing union types

```elm
type User = User { name: string }
noah = User { name: "Noah" }
```

-   [ ] lambdas `\x -> x + 1`, `\x y -> x + y`
-   [x] Typescript output
-   [ ] Javscript output
-   [ ] Type checking
-   [ ] Support for [Coed](https://github.com/eeue56/coed)
-   [ ] Syntax highlighting for editors

## 1.0.0

-   [ ] An automatic formatter with no options
-   [ ] Testing support via [Bach](https://github.com/eeue56/bach)
-   [ ] Benchmarking support via [Mainc](https://github.com/eeue56/mainc)

# Divergence from Elm

-   All top level consts or functions must have type definitions
-   Format strings ``

# Language support

Currently VSCode syntax highlighting is supported by this extenstion: https://github.com/eeue56/derw-syntax. It is not on the marketplace because Microsoft account creation was down when I tried.

Instead, you can do:

```
git clone https://github.com/eeue56/derw-syntax
cp -r derw-syntax ~/.vscode/extensions/derw-syntax-0.0.1
```

# Name

derw which means oak. Oak is one of the native trees in Wales, famous for it's long life, tall stature, and hard, good quality wood.
