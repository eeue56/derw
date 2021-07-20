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

# Language support

Currently VSCode syntax highlighting is supported by this extenstion: https://github.com/eeue56/derw-syntax. It is not on the marketplace because Microsoft account creation was down when I tried.

Instead, you can do:

```
git clone https://github.com/eeue56/derw-syntax
cp -r derw-syntax ~/.vscode/extensions/derw-syntax-0.0.1
```

# Name

derw which means oak. Oak is one of the native trees in Wales, famous for it's long life, tall stature, and hard, good quality wood.
