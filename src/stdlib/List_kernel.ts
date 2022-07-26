export function kernelLength(xs: any[]): number {
    return xs.length;
}

export function kernelEmptyList<a>(): a[] {
    return [];
}

export function kernelSort<a>(xs: a[]): a[] {
    const ys = [...xs];
    ys.sort();
    return ys;
}

export function kernelSortBy<a>(fn: (_0: a, _1: a) => number, xs: a[]): a[] {
    const ys = [...xs];
    ys.sort(fn);
    return ys;
}
