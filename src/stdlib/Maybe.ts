export { Maybe };
export { Just };
export { Nothing };
export { map };
export { withDefault };
export { andThen };

type Just<a> = {
    kind: "Just";
    value: a;
};

function Just<a>(args: { value: a }): Just<a> {
    return {
        kind: "Just",
        ...args,
    };
}

type Nothing = {
    kind: "Nothing";
};

function Nothing(args: {}): Nothing {
    return {
        kind: "Nothing",
        ...args,
    };
}

type Maybe<a> = Just<a> | Nothing;

function map<a, b>(fn: (arg0: a) => b, maybe: Maybe<a>): Maybe<b> {
    const _res103672936 = maybe;
    switch (_res103672936.kind) {
        case "Just": {
            const { value } = _res103672936;
            return Just({ value: fn(value) });
        }
        case "Nothing": {
            return Nothing({ });
        }
    }
}

function withDefault<a>(defaultValue: a, maybe: Maybe<a>): a {
    const _res103672936 = maybe;
    switch (_res103672936.kind) {
        case "Just": {
            const { value } = _res103672936;
            return value;
        }
        case "Nothing": {
            return defaultValue;
        }
    }
}

function andThen<a, b>(fn: (arg0: a) => Maybe<b>, maybe: Maybe<a>): Maybe<b> {
    const _res103672936 = maybe;
    switch (_res103672936.kind) {
        case "Just": {
            const { value } = _res103672936;
            return fn(value);
        }
        case "Nothing": {
            return Nothing({ });
        }
    }
}
