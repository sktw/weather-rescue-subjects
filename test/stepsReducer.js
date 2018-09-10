import {expect} from 'chai';
import reducer from '../src/reducers/steps';
import cornerReducer from '../src/reducers/cornerStep';
import lineReducer from '../src/reducers/lineStep';
import segmentReducer from '../src/reducers/segmentStep';
import * as StepActions from '../src/actions/step';
import * as AppActions from '../src/actions/app';
import {ImmutableChecker} from './testUtils';

const checker = new ImmutableChecker();

function chainActions(actions = [], initialState = reducer(undefined, {})) {
    return actions.reduce((state, action) => reducer(state, action), initialState);
}

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal({
            corner: cornerReducer(undefined, {}),
            line: lineReducer(undefined, {}),
            segment: segmentReducer(undefined, {})
        });
    });

    it('should deliver an action with a step property only to the appropriate reducer', () => {
        let state = chainActions();

        checker.setState(state);
        const action = StepActions.setZoomValue('corner', 'fit-page');

        expect(reducer(state, action)).to.deep.equal({
            corner: cornerReducer(state.corner, action),
            line: state.line,
            segment: state.segment
        });

        expect(checker.check()).to.be.true;
    });

    it('should deliver an action without a step property to all reducers', () => {
        let state = chainActions();

        checker.setState(state);
        const action = AppActions.reset();

        expect(reducer(state, action)).to.deep.equal({
            corner: cornerReducer(state.corner, action),
            line: lineReducer(state.line, action),
            segment: segmentReducer(state.segment, action)
        });

        expect(checker.check()).to.be.true;
    });
});
