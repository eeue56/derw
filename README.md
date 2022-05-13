# derw

An Elm-inspired language that transpiles to TypeScript

Homepage: https://derw-lang.github.io/

Follow Derw on Twitter: https://twitter.com/derwlang

# Install

```bash
npm install --save-dev derw
```

or

```bash
npm install -g derw
```

# Usage

```bash
npx derw

To get started:
Start a package via `derw init`
Compile via `derw compile`
Or compile and test via `derw test`
Or find out info via `derw info`
```

You can run the derw compiler via npx. You must provide files via `--files` or be in a package directory.

```bash
npx derw

Let\'s write some Derw code
To get started:
Provide entry files via --files
Or run me without args inside a package directory
  --files [string...]:      Filenames to be given
  --test :                  Test the project
  --target ts | js | derw | elm | english :  Target TS, JS, Derw, or Elm output
  --output string:          Output directory name
  --verify :                Run typescript compiler on generated files to ensure valid output
  --debug :                 Show a parsed object tree
  --only string:            Only show a particular object
  --run :                   Should be run via ts-node/node
  --names :                 Check for missing names out of scope
  --quiet :                 Keep it short and sweet
  -h, --help :              This help text
```

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
-   [x] Boolean equality `1 < 2`, `1 <= 2`, `1 == 2`, `1 != 2`, `1 > 2`, `1 >= 2`
-   [x] Boolean operations `true && false`, `not true`, `true || false`
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
-   [x] Lists `[ 1, 2, 3 ]`, `[ "hello", "world" ]`
-   [x] List ranges `[ 1..5 ]`, `[ start..end ]`

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

-   [x] Type aliases

    ```elm
    type alias User =
        { name: string }
    ```

-   [x] Object literals

    ```elm
    user: User
    user = { name: "Noah" }
    ```

-   [x] Object literals updates

    ```elm
    user: User
    user = { ...noah, name: "Noah" }
    ```

-   [x] Imports

    ```elm
    import List
    import Result exposing ( map )
    import something as banana
    ```

-   [x] Exports

    ```elm
    exposing ( map )
    ```

-   [x] Let statements

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

-   [x] strings in case..of
-   [x] defaults in case..of

    ```elm
    sayHiTo : string -> string
    sayHiTo name =
        case name of
            "Noah" -> "Hi " + name + !"
            default: "I don't know you"
    ```

-   [x] List destructing

    ```elm
    sum: List number -> number
    sum xs =
        case xs of
            [] -> 0
            y :: ys :: [] -> y + ys
            z :: zs -> z + sum zs
            default -> 0
    ```

-   [x] List destructing with string values

    ```elm
    sum: List string -> number
    sum xs =
        case xs of
            [] -> 0
            "1" :: ys :: [] -> 1 + 2
            "2" :: zs -> 2 + sum zs
            default -> 0
    ```


-   [x] List destructing with union types values

    ```elm
    sum: List (Maybe number) -> number
    sum xs =
        case xs of
            [] -> 0
            Just { value } :: rest -> value + sum rest
            Nothing :: rest -> sum rest
            default -> 0
    ```

-   [x] Constructing union types

    ```elm
    type User = User { name: string }
    noah = User { name: "Noah" }
    ```

-   [x] Accessors

    ```elm
    type alias User = { name: string }
    names = List.map .name [ { name: "Noah" }, { name: "Dave" } ]
    ```

-   [ ] Nested accessors

    ```elm
    type alias Group = { person: { name: string } }
    names = List.map .person.name [ { person: { name: "Noah" } }, { person: { name: "Dave" } } ]
    ```

-   [x] Errors on type name collison

    ````markdown
    The name `Person` has been used for different things.
    8 - 10:

    ```
    type Person =
        Person { name: string }
    ```

    11 - 14:

    ```
    type alias Person = {
        name: string
    }
    ```
    ````

-   [x] Errors on function name collison

    ````markdown
    The name `isTrue` has been used for different things.
    0 - 3:

    ```
    isTrue: boolean -> boolean
    isTrue x =
        x == true
    ```

    4 - 7:

    ```
    isTrue: boolean -> boolean
    isTrue x =
        x != true
    ```
    ````

-   [x] Some form of basic type errors

    ````markdown
    Failed to parse examples/errors/mismatching_types.derw due to:
    Error on lines 0 - 3
    Expected `boolean` but got `number` in the body of the function:

    ```
    isTrue: boolean -> boolean
    isTrue x =
        1 + 2
    ```

    Error on lines 4 - 7
    Expected `List string` but got `List number`:

    ```
    names: List string
    names =
        [1..2]
    ```
    ````

-   [x] lambdas `\x -> x + 1`, `\x y -> x + y`
-   [x] Typescript output
-   [x] Javscript output
-   [x] Elm output
-   [x] Module resolution
-   [x] CLI
-   [x] Basic type checking
-   [x] Detect if types exist in current namespace
-   [x] Syntax highlighting for editors
-   [x] Collision detection for names in a module
-   [x] Importing of Derw files

    ```elm
    import "./other"
    import "./something" as banana
    import "./another" exposing ( isTrue, isFalse )
    ```

-   [x] Errors when failing to find relative import

    ```
    Warning! Failed to find `examples/derw_imports/banana` as either derw, ts or js
    ```

-   [x] Single line comments

    ```elm
    -- hello
    isTrue: boolean -> boolean
    isTrue x =
        x
    ```

-   [x] Single line comments in function or const bodies

    ```elm
    isTrue: boolean -> boolean
    isTrue x =
        -- hello
        x
    ```

-   [x] Multiline comments

    ```elm
    {-
    hello
    world
    -}
    isTrue: boolean -> boolean
    isTrue x =
        x
    ```

-   [x] Function arguments

    ```elm
    map: (a -> b) -> a -> b
    map fn value =
        fn value
    ```

-   [x] Globals

    Globals can be accessed through the `globalThis` module which is imported into every namespace. E.g `globalThis.console.log`

-   [x] Constant if statements

    ```elm
    name: string
    name =
        if 1 == 1 then
            "Noah"
        else
            "James"
    ```

-   [x] Constant case statements

    ```elm
    name: string
    name =
        case person of
            "n" -> "Noah"
            "j" -> "James"
            default -> "Other"
    ```

-   [x] List prepend

    ```elm
    numbers: List number
    numbers =
        1 :: [ 2, 3 ]
    ```

## 1.0.0

-   [x] An automatic formatter with no options

    ```
    derw format
    ```

-   [ ] A standard library
-   [x] Support for [Coed](https://github.com/eeue56/coed)

    Use [html](https://github.com/derw-lang/html)

-   [x] Testing support via [Bach](https://github.com/eeue56/bach)

    Write a file with `_test` as an extension (e.g `List_test.derw`).

    ```elm
    import Test exposing (equals)

    testMath: boolean -> void
    testMath a? =
        equals 1 1
    ```

    Compile it, then run bach via `npx @eeue56/bach`

-   [ ] Type checking
-   [ ] Benchmarking support via [Mainc](https://github.com/eeue56/mainc)
-   [ ] Async support
-   [x] Packaging
-   [x] Package init

    ```
    derw init
    ```

-   [x] Package testing

    ```
    # inside a package directory
    derw test
    ```

-   [x] Compile a package

    ```
    derw compile
    ```

-   [x] Install a package

    ```
    derw install --name derw-lang/stdlib --version main
    ```

-   [x] An info command to find out stats about modules

    ```
    derw init
    ```

-   [x] A repl

    ```
    derw repl
    ```

-   [x] Bundling

    ```
    derw bundle --entry src/Main.derw --output dist/index.js --watch --quiet
    ```

-   [x] English output

    ```
    derw compile --target english
    ```

-   [x] Template generation

    ```
    derw template --path src/Main.derw --template web
    ```

# 2.0.0

-   [ ] Time travelling debugger
-   [ ] Type checking with interop with TypeScript
-   [ ] Derw compiler is written in Derw

# Divergence from Elm

-   All top level consts or functions must have type definitions
-   Format strings ``
-   No need for module names in the module file itself. Use `exposing` instead

# Editor language support

Currently VSCode syntax highlighting is supported by this extension: https://github.com/eeue56/derw-syntax. It is not on the marketplace because Microsoft account creation was down when I tried.

Instead, you can do:

```

git clone https://github.com/derw-lang/derw-syntax
cp -r derw-syntax ~/.vscode/extensions/derw-syntax-0.0.1

```

# VScode Language server

```

git clone https://github.com/derw-lang/derw-language-server
cp -r derw-language-server ~/.vscode/extensions/derw-language-server-0.0.1

```

# Name

derw which means oak. Oak is one of the native trees in Wales, famous for it's long life, tall stature, and hard, good quality wood. An English speaker might pronounce it as "deh-ru".
