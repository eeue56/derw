import * as Kernel from "./Bitwise_kernel";

export { leftShift };
export { or };

function leftShift(a: number, b: number): number {
    return Kernel.leftShift(a, b);
}

function or(a: number, b: number): number {
    return Kernel.or(a, b);
}
