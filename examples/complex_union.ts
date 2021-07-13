type Dog = {
    kind: "Dog";
    name: string;
};

function Dog(name: string): Dog {
    return {
        kind: "Dog",
        name,
    };
}

type Cat = {
    kind: "Cat";
    lives: number;
};

function Cat(lives: number): Cat {
    return {
        kind: "Cat",
        lives,
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
