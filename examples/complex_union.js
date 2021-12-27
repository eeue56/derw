function Dog(args) {
    return {
        kind: "Dog",
        ...args,
    };
}

function Cat(args) {
    return {
        kind: "Cat",
        ...args,
    };
}

function sayHiToPet(pet) {
    const _res = pet;
    switch (_res.kind) {
        case "Dog": {
            const { name } = _res;
            return `Good boy ${name}!`;
        }
        case "Cat": {
            const { lives } = _res;
            return "You have " + lives + " lives remaining.";
        }
    }
}

const main = console.log(sayHiToPet(Dog({ name: "roof" })));
