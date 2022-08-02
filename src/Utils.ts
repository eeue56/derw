import * as Bitwise from "./stdlib/Bitwise_kernel";

import * as List from "./stdlib/List";

export { getNameFromPath };
export { isTestFile };
export { hashCode };

function getNameFromPath(path: string): string {
    const splitByPathSymbol: string[] = path.split("/");
    const lastElement: string = (function (): any {
        const _res118108815 = splitByPathSymbol.slice(-1);
        switch (_res118108815.length) {
            case _res118108815.length: {
                if (_res118108815.length === 1) {
                    const [ x ] = _res118108815;
                    return (function(y: any) {
                return y[0];
            })(x.split("."));
                }
            }
            default: {
                return "";
            }
        }
    })();
    return lastElement;
}

function isTestFile(name: string): boolean {
    return name.endsWith("_test.derw");
}

function hashCodeStep(charCode: number, hash: number): number {
    const added: number = hash + charCode;
    const shift: number = Bitwise.leftShift(hash, 5);
    const subtracted: number = shift - added;
    return Bitwise.or(subtracted, 0);
}

function hashCode(str: string): number {
    return (function(y: any) {
        return Math.abs(y);
    })(List.foldl(hashCodeStep, 0, List.map(function(letter: any) {
        return letter.charCodeAt(0);
    }, str.split(""))));
}
