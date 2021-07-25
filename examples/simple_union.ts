type True = {
    kind: "True";
};

function True(args: {}): True {
    return {
        kind: "True",
        ...args,
    };
}

type False = {
    kind: "False";
};

function False(args: {}): False {
    return {
        kind: "False",
        ...args,
    };
}

type Binary = True | False;

function isTruthy(binary: Binary): boolean {
    switch (binary.kind) {
        case "True": {
            return true;
        }
        case "False": {
            return false;
        }
    }
}
