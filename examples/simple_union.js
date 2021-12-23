function One(args) {
    return {
        kind: "One",
        ...args,
    };
}

function Zero(args) {
    return {
        kind: "Zero",
        ...args,
    };
}

function isTruthy(binary) {
    switch (binary.kind) {
        case "One": {
            return true;
        }
        case "Zero": {
            return false;
        }
    }
}
