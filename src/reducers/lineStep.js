import {objectAssign, inheritReducer} from '../utils';
import stepReducer from './step';

function getInitialState() {
    return {
        tool: 'edit',
        lines: [],
        stale: true
    };
}

function setTool(state, action) {
    return objectAssign({}, state, {tool: action.tool});
}

function setLines(state, action) {
    return objectAssign({}, state, {lines: action.lines, stale: false});
}

function setCorners(state) {
    return objectAssign({}, state, {stale: true});
}

function reset(state) {
    return objectAssign({}, state, {lines: [], stale: true});
}

function reducer(state = getInitialState(), action) {

    switch (action.type) {
        case 'SET_TOOL':
            return setTool(state, action);
        case 'SET_LINES':
            return setLines(state, action);
        case 'SET_CORNERS':
            return setCorners(state, action);
        case 'RESET':
            return reset(state);
        default:
            return state;
    }
}

export default inheritReducer(stepReducer, reducer);
