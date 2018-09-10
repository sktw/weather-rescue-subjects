import {objectAssign} from '../utils';

function getInitialState() {
    return {
        zoomValue: 'actual-size',
        zoomPercentage: 100,
        rotation: 0,
        error: null
    };
}

function setZoomValue(state, action) {
    return objectAssign({}, state, {zoomValue: action.zoomValue});
}

function setZoomPercentage(state, action) {
    return objectAssign({}, state, {zoomValue: action.zoomValue, zoomPercentage: action.zoomPercentage});
}

function applyRotation(state, action) {
    let rotation = (state.rotation + action.delta + 4) % 4;
    return objectAssign({}, state, {rotation});
}

function setError(state, action) {
    return objectAssign({}, state, {error: action.error});
}

function clearError(state) {
    return objectAssign({}, state, {error: null});
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case 'SET_ZOOM_VALUE':
            return setZoomValue(state, action);
        
        case 'SET_ZOOM_PERCENTAGE':
            return setZoomPercentage(state, action);

        case 'APPLY_ROTATION':
            return applyRotation(state, action);

        case 'SET_ERROR':
            return setError(state, action);

        case 'CLEAR_ERROR':
            return clearError(state);

        default:
            return state;

    }
}

export default reducer;
