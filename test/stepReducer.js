import {expect} from 'chai';
import reducer from '../src/reducers/step';
import * as Actions from '../src/actions/step';
import {ImmutableChecker} from './testUtils';

const checker = new ImmutableChecker();

function chainActions(actions = [], initialState = reducer(undefined, {})) {
    return actions.reduce((state, action) => reducer(state, action), initialState);
}

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal({
            zoomValue: 'actual-size',
            zoomPercentage: 100,
            rotation: 0,
            error: null
        });
    });

    it('should set zoom value', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, Actions.setZoomValue('corner', 'fit-page'))).to.deep.include({
            zoomValue: 'fit-page'
        });

        expect(checker.check()).to.be.true;
    });

    it('should set zoom percentage', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, Actions.setZoomPercentage('corner', 'fit-page', 52))).to.deep.include({
            zoomValue: 'fit-page',
            zoomPercentage: 52
        });

        expect(checker.check()).to.be.true;
    });

    it('should apply rotation of 90 degrees anticlockwise', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, Actions.applyRotation('corner', 1))).to.deep.include({
            rotation: 1
        });

        expect(checker.check()).to.be.true;
    });

    it('should apply overall rotation of 360 degrees', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, Actions.applyRotation('corner', 4))).to.deep.include({
            rotation: 0
        });

        expect(checker.check()).to.be.true;
    });

    it('should set error', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, Actions.setError('line', 'Error'))).to.deep.include({
            error: 'Error'
        });

        expect(checker.check()).to.be.true;
    });

    it('should clear error', () => {
        let state = chainActions([Actions.setError('line', 'Error')]);
        checker.setState(state);

        expect(reducer(state, Actions.clearError('line'))).to.deep.include({
            error: null
        });

        expect(checker.check()).to.be.true;
    });
});
