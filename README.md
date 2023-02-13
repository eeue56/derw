# derw

An Elm-inspired language that transpiles to TypeScript

Homepage: https://www.derw-lang.com/

Check out the Gitbook for more info: https://docs.derw-lang.com/

Follow Derw on Twitter: https://twitter.com/derwlang

# Install

The compiler runs through ts-node currently, so you'll need to install that via `npm install -g ts-node`.

You can also just use node, through running `node <path-to-derw>/build/cli.js`.

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
    import "./Maybe" as Maybe exposing (Maybe)
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

-   [x] Do notation

    ```elm
    sayHi: string -> void
    sayHi name =
        do
            globalThis.console.log "Hello" name
        return
            undefined
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

# VScode auto-formatting

```

git clone https://github.com/derw-lang/derw-formatter-vscode
cp -r derw-formatter-vscode ~/.vscode/extensions/derw-formatter-vscode-0.0.1

```

# Name

derw which means oak. Oak is one of the native trees in Wales, famous for it's long life, tall stature, and hard, good quality wood. An English speaker might pronounce it as "deh-ru".

# Working on the compiler

Right now the compiler is easiest for me to work on, which means that it's better to either open an issue or reach out to me on Twitter before opening a pull request. That being said: well reasoned pull requests that fit into my plans are totally welcome, across any Derw repo.

This repo contains the compiler, which is split into: parser, tokenizer, type checking, cli and generators.

The flow for compliation looks roughly like:

- Split content into blocks of functions, constants, imports, exports and types.
- Tokenize each block
- Parse each block into an AST
- Check names for collisions and imports
- Check types
- Generate target code

The CLI is mostly responsible for handling all these steps, but the library can be used programatically as it is in the [playground](https://github.com/derw-lang/playground/). Each file in the [src/cli](./src/cli/) folder is responsible for the different abilities of the CLI: installing, formatting, bundling, testing, compiling, templating, etc. These functions all follow the same API to make working on them easier. My rule in designing the CLIs is that they should be obvious on how to use them. There should be a limited number of commands: but I don't want developers to need to install multiple tools to perform standard operations, like formatting or testing. It uses [Baner](https://github.com/eeue56/baner) under the hood for parsing the flags and arguments, so check out the [docs](https://github.com/eeue56/baner/blob/main/docs/src/baner.md) for that if you're unsure.

The generation files are split between Derw, TypeScript, Javascript and Elm. Generally the rule is to avoid code sharing between these as much as possible, as it's easier to read when the code is all in one file and you can clearly see what each AST token generates. That being said, there are some shared files - for example, code for handling indentation. Adding a new code generation target is simplest done by copying the TypeScript generation file - but please reach out to me if you have a new target in mind!

The parser follows a simple rule of one function per expression. There should be only one expression type returned by each parser, and figuring out which to call is done by the main `parseExpression` function. The code here is mostly token based, though in some places it is just done through string manipulation. This is intended to be re-written in Derw in the future, so big refactors aren't necessary at the moment.

Every bug encountered in the parser needs to have a test added for it. There's a combination of tests, some running on library code, some running on short snippets to ensure the parser and generators are consistent. You can find this all in the [src/tests](./src/tests/) folder. To make a new test, just copy one of the existing tests and rename it. It must end with `_test.ts` in order for the test runner to pick it up. You can run the whole suite through `npm run test`, or specifics via `npm run test --file {name of file}`. You can also specify a specific function via the `--function {name of function}` flag, useful for testing just the `testParse` or `testGenerate` of each file. There is also the `--only-fails` flag, useful for just seeing failing tests. Typically snippet tests should test block analysis, parsing, generation, and running the generated TypeScript through tsc. Check out [src/tests/simple_function_test.ts](./src/tests/simple_function_test.ts) for an example on how each of those is done. You'll want to also have a [derw-lang/stdlib](https://github.com/derw-lang/stdlib/) folder in the same folder as `derw` to ensure that the stdlib tests can run.
