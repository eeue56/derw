function levDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    if (a.toLowerCase() === b.toLowerCase()) return 0;

    const matrix: number[][] = [];

    // increment along the first column of each row
    let i;
    for (i = 0; i <= b.length; i += 1) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    let j;
    for (j = 0; j <= a.length; j += 1) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i += 1) {
        for (j = 1; j <= a.length; j += 1) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1
                    )
                ); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

type Match = {
    name: string;
    distance: number;
};

function sortByDistance(list: Match[]): Match[] {
    return list.slice(0).sort((a, b) => {
        return a.distance < b.distance ? -1 : a.distance > b.distance ? 1 : 0;
    });
}

export function suggestName(
    nameToFind: string,
    alternatives: string[]
): string[] {
    const possibleMatches = alternatives
        .map((name) => ({
            name,
            distance: levDistance(name, nameToFind),
        }))
        .filter((alternative) => alternative.distance < 3);

    return sortByDistance(possibleMatches).map(
        (alternative) => alternative.name
    );
}
