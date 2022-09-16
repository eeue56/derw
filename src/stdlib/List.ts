import { kernelLength, kernelEmptyList, kernelSort, kernelSortBy, kernelStatefulFold } from "./List_kernel";

import { Maybe } from "./Maybe";

export { emptyList };
export { map };
export { indexedMap };
export { filter };
export { foldl };
export { statefulFold };
export { foldr };
export { filterMap };
export { append };
export { reverse };
export { length };
export { take };
export { drop };
export { sort };
export { sortBy };

const emptyList: any[] = [ ];

function map<a, b>(fn: (arg0: a) => b, xs: a[]): b[] {
    return xs.map(fn);
}

function indexedMap<a, b>(fn: (arg0: a, arg1: number) => b, xs: a[]): b[] {
    return xs.map(fn);
}

function filter<a>(fn: (arg0: a) => boolean, xs: a[]): a[] {
    return xs.filter(fn);
}

function foldl<a, b>(fn: (arg0: a, arg1: b) => b, init: b, xs: a[]): b {
    return xs.reduce(function(a: any, b: any) {
        return fn(b, a);
    }, init);
}

function statefulFold<item, state>(fn: (arg0: item, arg1: state) => state, init: state, xs: item[]): state {
    return kernelStatefulFold(fn, init, xs);
}

function foldr<a, b>(fn: (arg0: a, arg1: b) => b, init: b, xs: a[]): b {
    return xs.reduceRight(function(a: any, b: any) {
        return fn(b, a);
    }, init);
}

function filterMapHelp<a, b>(fn: (arg0: a) => Maybe<b>, a: a, xs: b[]): b[] {
    const maybe: Maybe<b> = fn(a);
    switch (maybe.kind) {
        case "Just": {
            const { value } = maybe;
            return append(xs, [ value ]);
        }
        case "Nothing": {
            return xs;
        }
    }
}

function filterMap<a, b>(fn: (arg0: a) => Maybe<b>, xs: a[]): b[] {
    return foldl(function(y: any, ys: any) {
        return filterMapHelp(fn, y, ys);
    }, [ ], xs);
}

function append<a>(xs: a[], ys: a[]): a[] {
    return (function(x: any) {
        return x.concat(xs, ys);
    })(kernelEmptyList());
}

function reverse<a>(xs: a[]): a[] {
    return xs.reverse();
}

function length<a>(xs: a[]): number {
    return kernelLength(xs);
}

function take<a>(n: number, xs: a[]): a[] {
    return xs.slice(0, n);
}

function drop<a>(n: number, xs: a[]): a[] {
    return xs.slice(n, xs.length);
}

function sort<a>(xs: a[]): a[] {
    return kernelSort(xs);
}

function sortBy<a>(fn: (arg0: a, arg1: a) => number, xs: a[]): a[] {
    return kernelSortBy(fn, xs);
}
