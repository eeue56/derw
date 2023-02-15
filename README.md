# derw

Welcome to Derw! Derw is a type-safe language in the ML family designed to replace or augment your TypeScript and JavaScript code - both on the client and the server. If you've never encountered an ML language before, some of the core principles - which Derw follows - is a clean and concise syntax, paired with a powerful type system. Here's some real world Derw code:

```elm
generateTypeAlias: TypeAlias -> string
generateTypeAlias syntax =
    let
        properties: string
        properties =
            List.map generateProperty syntax.properties
                |> (\y -> y.join ",\n    ")

        typeDef: string
        typeDef =
            generateType syntax.type
    in
        if syntax.properties.length == 0 then
            `type alias ${typeDef} = {\n}`
        else
            `type alias ${typeDef} = {\n    ${properties}\n}`
```

## Why might you use Derw?

Derw is a language for those searching for a better syntax for writing type-heavy code. It is a general purpose language, for both the server and the client, built on top of the JavaScript platform. It has interop with Javascript and TypeScript built in - so that you can use existing code and libraries with minimal effort. Derw targets multiple languages - TypeScript, JavaScript, Elm, English and Derw itself. Derw's output generation is documented in the [Gitbook](https://docs.derw-lang.com/), so it's easy to create code to interface between Derw and TypeScript.

If you want to write a website, both backend and frontend, Derw is a perfect choice for you.

## Batteries built-in

-   A testing framework (all of Derw's compiler tests use this library!)
-   Performant web framework with server side rendering and hydration
-   Bundling built into the CLI
-   Write better code by leveraging a type system that guides your code.
-   Integrate with your existing code bases through interop with JavaScript and TypeScript.

## Getting Started

Head over to the [Gitbook](https://docs.derw-lang.com/).

## Staying up to date

Homepage: https://www.derw-lang.com/

Blog: http://derw.substack.com/

Follow Derw on Twitter: https://twitter.com/derwlang

# Name

derw (/ˈdeːruː/, Welsh “oak”) is one of the native trees in Wales, famous for long life, tall stature, and hard, good quality wood. An English speaker might pronounce it as “deh-ru”.
