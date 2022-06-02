import { tokenize } from "../tokens";

export function log(x: string): void {
    console.log(x);
    tokenize(x)
        .map((token) => {
            if ((token as any).body)
                return `${token.kind}("${(token as any).body}"),`;
            return `${token.kind}(),`;
        })
        .forEach((token) => {
            console.log(token);
        });
}
