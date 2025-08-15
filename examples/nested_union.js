function Just(args) {
    return {
        kind: "Just",
        ...args,
    };
}

function nothing(args) {
    return {
        kind: "nothing",
        ...args,
    };
}

function something(x) {
    return x;
}

const other = [];
