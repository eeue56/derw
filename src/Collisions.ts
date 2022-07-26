import * as List from "./stdlib/List";

import * as Maybe from "./stdlib/Maybe";
import { Just, Nothing } from "./stdlib/Maybe";

import { Block, ImportModule } from "./types";

export { Collision };
export { collisions };

type Collision = {
    name: string;
    indexes: number[];
}

function Collision(args: { name: string, indexes: number[] }): Collision {
    return {
        ...args,
    };
}

type Seen = {
    indexes: number[];
    name: string;
}

function Seen(args: { indexes: number[], name: string }): Seen {
    return {
        ...args,
    };
}

type Names = {
    modules: Seen[];
    values: Seen[];
}

function Names(args: { modules: Seen[], values: Seen[] }): Names {
    return {
        ...args,
    };
}

function moduleNames(index: number, module: ImportModule): Names {
    const moduleName: string = (function (): any {
        const _res195078222 = module.alias;
        switch (_res195078222.kind) {
            case "Just": {
                const { value } = _res195078222;
                return value;
            }
            case "Nothing": {
                return module.name;
            }
        }
    })();
    return {
        modules: [ {
        name: moduleName,
        indexes: [ index ]
    } ],
        values: List.map(function(name: any) {
        return {
        indexes: [ index ],
        name
    };
    }, module.exposing)
    };
}

function blockNames(block: Block, index: number): Names {
    const _res93832333 = block;
    switch (_res93832333.kind) {
        case "Function": {
            const { name } = _res93832333;
            return {
            modules: [ ],
            values: [ {
            name,
            indexes: [ index ]
        } ]
        };
        }
        case "Const": {
            const { name } = _res93832333;
            return {
            modules: [ ],
            values: [ {
            name,
            indexes: [ index ]
        } ]
        };
        }
        case "UnionType": {
            const { type } = _res93832333;
            return {
            modules: [ ],
            values: [ {
            name: type.name,
            indexes: [ index ]
        } ]
        };
        }
        case "TypeAlias": {
            const { type } = _res93832333;
            return {
            modules: [ ],
            values: [ {
            name: type.name,
            indexes: [ index ]
        } ]
        };
        }
        case "Import": {
            const { modules } = _res93832333;
            function step(module: ImportModule, names: Names): Names {
                const modNames: Names = moduleNames(index, module);
                return {
                    modules: List.append(names.modules, modNames.modules),
                    values: List.append(names.values, modNames.values)
                };
            }
            return List.foldr(step, {
            modules: [ ],
            values: [ ]
        }, modules);
        }
        default: {
            return {
            modules: [ ],
            values: [ ]
        };
        }
    }
}

function mergeSeen(seen: Seen, seens: Seen[]): Seen[] {
    const hasBeenSeen: boolean = (function(x: any) {
        return x.length > 0;
    })(List.filter(function(x: any) {
        return x.name === seen.name;
    }, seens));
    function mapper(innerSeen: Seen): Seen {
        if (innerSeen.name === seen.name) {
            return {
                name: innerSeen.name,
                indexes: List.append(seen.indexes, innerSeen.indexes)
            };
        } else {
            return innerSeen;
        }
    }
    if (hasBeenSeen) {
        return List.map(mapper, seens);
    } else {
        return [ seen, ...seens ];
    }
}

function mergeNames(first: Names, second: Names): Names {
    const modules: Seen[] = List.foldr(mergeSeen, [ ], List.append(first.modules, second.modules));
    const values: Seen[] = List.foldr(mergeSeen, [ ], List.append(first.values, second.values));
    return {
        modules,
        values
    };
}

function flattenNames(names: Names[]): Names {
    return List.foldr(function(currentNames: any, finalNames: any) {
        return mergeNames(currentNames, finalNames);
    }, {
        modules: [ ],
        values: [ ]
    }, names);
}

function seenToCollision(seen: Seen): Maybe.Maybe<Collision> {
    if (seen.indexes.length > 1) {
        return Just({ value: {
            name: seen.name,
            indexes: seen.indexes
        } });
    } else {
        return Nothing({ });
    }
}

function namesToCollisions(names: Names): Collision[] {
    function collisionStep(seen: Seen, collisions: Collision[]): Collision[] {
        const _res311046558 = seenToCollision(seen);
        switch (_res311046558.kind) {
            case "Nothing": {
                return collisions;
            }
            case "Just": {
                const { value } = _res311046558;
                return [ {
                name: value.name,
                indexes: value.indexes
            }, ...collisions ];
            }
        }
    }
    const moduleCollisions: Collision[] = List.foldr(collisionStep, [ ], names.modules);
    const valueCollisions: Collision[] = List.foldr(collisionStep, [ ], names.values);
    return List.append(moduleCollisions, valueCollisions);
}

function collisions(blocks: Block[]): Collision[] {
    return namesToCollisions(flattenNames(List.indexedMap(blockNames, blocks)));
}
