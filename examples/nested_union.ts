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

type nothing = {
    kind: "nothing";
};

function nothing(args: {}): nothing {
    return {
        kind: "nothing",
        ...args,
    };
}

type Maybe<a> = Just<a> | nothing;

function something(x: Maybe<string>): Maybe<string> {
    return x;
}

const other: Maybe<Binary>[] = [];
