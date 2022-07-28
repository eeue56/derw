type Dog = {
    kind: "Dog";
    name: string;
};

function Dog(args: { name: string }): Dog {
    return {
        kind: "Dog",
        ...args,
    };
}

type Cat = {
    kind: "Cat";
    lives: number;
};

function Cat(args: { lives: number }): Cat {
    return {
        kind: "Cat",
        ...args,
    };
}

type Animal = Dog | Cat;

function sayHiToPet(pet: Animal): string {
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

const main: void = console.log(sayHiToPet(Dog({ name: "roof" })));
