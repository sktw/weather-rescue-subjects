// elm-inspired classList
// http://package.elm-lang.org/packages/elm-lang/html/2.0.0/Html-Attributes#classList

export function classList(parts) {
    const classes = parts.reduce((acc, [string, cond]) => {
        if (cond) {
            acc.push(string);
        }
        return acc;
    }, []);

    if (classes.length === 0) {
        return null;
    }
    else {
        return classes.join(' ');
    }
}

export function objectAssign() {
    const target = arguments[0];

    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];

        for (let key in source) {
            target[key] = source[key];
        }
    }

    return target;
}

export function filledArray(n, value) {
    // return array of length n filled with value
    let func;

    if (typeof value !== 'function') {
        func = () => value;
    }
    else {
        func = value;
    }

    const array = [];
    for (let i = 0; i < n; i++) {
        array.push(func());
    }

    return array;
}

export function unique(array) {
    // return unique elements in array
    const elems = {}

    return array.filter(elem => {
        if (elems[elem]) {
            return false;
        }
        else {
            elems[elem] = true;
            return true;
        }
    });
}

export function cloneArray(array) {
    return array.slice(0);
}

export function inheritReducer(superReducer, subReducer) {
    return function(state, action) {
        if (state === undefined) {
            const superState = superReducer(state, action);
            const subState = subReducer(state, action);
            return objectAssign({}, superState, subState);
        }
        else {
            state = superReducer(state, action);
            return subReducer(state, action);
        }
    };
}

export function sortBy(keyfunc) {
    return function (a, b) {
        const x = keyfunc(a);
        const y = keyfunc(b);
        return (x > y) - (y > x);
    }
}

export function switchOn(value, map) {
    if (map.hasOwnProperty(value)) {
        map[value]();
    }
    else if (map.hasOwnProperty('default')) {
        map['default']();
    }
}

export function url(path) {
    if (path.charAt(0) === '/') {
        throw new Error('path must be relative');
    }
    else if (PUBLIC_PATH === '/') {
        return PUBLIC_PATH + path;
    }
    else {
        return PUBLIC_PATH + '/' + path;
    }
}
