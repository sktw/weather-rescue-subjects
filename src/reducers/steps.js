import {objectAssign} from '../utils';
import cornerStep from './cornerStep';
import lineStep from './lineStep';
import segmentStep from './segmentStep';

function getInitialState() {
    return {};
}

const stepReducers = {
    corner: cornerStep,
    line: lineStep,
    segment: segmentStep
};

function reducer(state = getInitialState(), action) {
    if (action.hasOwnProperty('step')) { // if action has step property, pass action to that reducer only
        const step = action.step;
        return objectAssign({}, state, {[step]: stepReducers[step](state[step], action)});
    }
    else { // pass action to all reducers
        const nextState = {};

        for (var step in stepReducers) {
            nextState[step] = stepReducers[step](state[step], action);
        }
        
        return nextState;
    }
}

export default reducer;
