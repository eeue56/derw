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
    switch (pet.kind) {
        case "Dog": {
            const { name } = pet;
            return `Good boy ${name}!`;
        }
        case "Cat": {
            const { lives } = pet;
            return "You have " + lives + " lives remaining.";
        }
    }
}

const main = console.log(sayHiToPet(Dog({ name: "roof" })));
