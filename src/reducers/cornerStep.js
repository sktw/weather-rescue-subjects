import {objectAssign, inheritReducer} from '../utils';
import stepReducer from './step';

function getInitialState() {
    return {
        tool: 'draw',
        corners: []
    };
}

function setTool(state, action) {
    return objectAssign({}, state, {tool: action.tool});
}

function setCorners(state, action) {
    return objectAssign({}, state, {corners: action.corners});
}

function reset(state) {
    return objectAssign({}, state, {corners: []});
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case 'SET_TOOL':
            return setTool(state, action);
        case 'SET_CORNERS':
            return setCorners(state, action);
        case 'RESET':
            return reset(state);
        default:
            return state;
    }
}

export default inheritReducer(stepReducer, reducer);
