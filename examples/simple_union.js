function True(args) {
    return {
        kind: "True",
        ...args,
    };
}

function False(args) {
    return {
        kind: "False",
        ...args,
    };
}

function isTruthy(binary) {
    switch (binary.kind) {
        case "True": {
            return true;
        }
        case "False": {
            return false;
        }
    }
}
