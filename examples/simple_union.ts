type One = {
    kind: "One";
};

function One(args: {}): One {
    return {
        kind: "One",
        ...args,
    };
}

type Zero = {
    kind: "Zero";
};

function Zero(args: {}): Zero {
    return {
        kind: "Zero",
        ...args,
    };
}

type Binary = One | Zero;

function isTruthy(binary: Binary): boolean {
    switch (binary.kind) {
        case "One": {
            return true;
        }
        case "Zero": {
            return false;
        }
    }
}
