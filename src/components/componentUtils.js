import React from 'react';
import {objectAssign} from '../utils';

export function renderWithProps(children, props) {
    return React.Children.map(children, child => React.cloneElement(child, props));
}

export function renderBlock(children, key) {
    let block = null;
    React.Children.forEach(children, child => {
        if (child.key === key) {
            block = child;
        }
    });

    return block;
}

export function extendPropTypes(superPropTypes, subPropTypes) {
    return objectAssign({}, superPropTypes, subPropTypes);
}

export function extendMapStateToProps(superMSTP, subMSTP) {
    return function(storeState, props) {
        return objectAssign({}, superMSTP(storeState, props), subMSTP(storeState, props));
    }
}

export function pickProps(cls, props) {
    const picked = {};

    for (let name in props) {
        if (cls.propTypes.hasOwnProperty(name)) {
            picked[name] = props[name];
        }
    }

    return picked;
}

export function px(value) {
    return value + 'px';
}
