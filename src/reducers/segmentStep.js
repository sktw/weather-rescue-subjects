import {objectAssign, inheritReducer, cloneArray, filledArray} from '../utils';
import stepReducer from './step';

function getInitialState() {
    return {
        tool: 'edit',
        segments: [],
        segmentsOk: [],
        stale: true
    };
}

function setTool(state, action) {
    return objectAssign({}, state, {tool: action.tool});
}

function setSegments(state, action) {
    const {segments} = action;
    const segmentsOk = filledArray(segments.length, 'y');
    return objectAssign({}, state, {segments, segmentsOk, stale: false});
}

function setSegment(state, action) {
    const segments = cloneArray(state.segments);
    segments[action.index] = action.segment;
    return objectAssign({}, state, {segments});
}

function setSegmentOk(state, action) {
    const segmentsOk = cloneArray(state.segmentsOk);
    segmentsOk[action.index] = action.response;
    return objectAssign({}, state, {segmentsOk});
}

function setLines(state) {
    return objectAssign({}, state, {stale: true});
}

function reset(state) {
    return objectAssign({}, state, {segments: [], segmentsOk: [], stale: true});
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case 'SET_TOOL':
            return setTool(state, action);
        case 'SET_SEGMENTS':
            return setSegments(state, action);
        case 'SET_SEGMENT':
            return setSegment(state, action);
        case 'SET_SEGMENT_OK':
            return setSegmentOk(state, action);
        case 'SET_LINES':
            return setLines(state);
        case 'RESET':
            return reset(state);
        default:
            return state;
    }
}

export default inheritReducer(stepReducer, reducer);
