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
    const _res110879 = pet;
    switch (_res110879.kind) {
        case "Dog": {
            const { name } = _res110879;
            return `Good boy ${name}!`;
        }
        case "Cat": {
            const { lives } = _res110879;
            return "You have " + lives + " lives remaining.";
        }
    }
}

const main = console.log(sayHiToPet(Dog({ name: "roof" })));
