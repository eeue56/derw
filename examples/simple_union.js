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
    const _res = binary;
    switch (_res.kind) {
        case "One": {
            return true;
        }
        case "Zero": {
            return false;
        }
    }
}
