import {expect} from 'chai';
import reducer from '../src/reducers/cornerStep';
import * as StepActions from '../src/actions/step';
import * as CornerActions from '../src/actions/cornerStep';
import * as AppActions from '../src/actions/app';
import {ImmutableChecker} from './testUtils';

const checker = new ImmutableChecker();

function chainActions(actions = [], initialState = reducer(undefined, {})) {
    return actions.reduce((state, action) => reducer(state, action), initialState);
}

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.include({
            tool: 'draw',
            corners: []
        });
    });

    it('should set tool', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, StepActions.setTool('corner', 'edit'))).to.deep.include({
            tool: 'edit'
        });

        expect(checker.check()).to.be.true;
    });

    it('should set corners', () => {
        let state = chainActions();
        checker.setState(state);
        const corners = [[0, 0], [500, 0], [0, 1000], [500, 1000]];

        expect(reducer(state, CornerActions.setCorners(corners))).to.deep.include({
            corners
        });

        expect(checker.check()).to.be.true;
    });

    it('should reset', () => {
        const corners = [[0, 0], [500, 0], [0, 1000], [500, 1000]];
        let state = chainActions([StepActions.setTool('corner', 'edit'), CornerActions.setCorners(corners)]);

        checker.setState(state);

        expect(reducer(state, AppActions.reset())).to.deep.include({
            tool: 'edit',
            corners: []
        });

        expect(checker.check()).to.be.true;
    });

});
