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
    const _res1388966911 = binary;
    switch (_res1388966911.kind) {
        case "One": {
            return true;
        }
        case "Zero": {
            return false;
        }
    }
}
