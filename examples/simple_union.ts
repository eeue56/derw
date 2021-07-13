type True = {
    kind: "True";
};

function True(): True {
    return {
        kind: "True",
    };
}

type False = {
    kind: "False";
};

function False(): False {
    return {
        kind: "False",
    };
}

type Binary = True | False;

function isTruthy(binary: Binary): boolean {
    switch (binary.kind) {
        case "True":
            return true;
        case "False":
            return false;
    }
}
