import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer from '../src/reducers/lineStep';
import * as StepActions from '../src/actions/step';
import * as CornerActions from '../src/actions/cornerStep';
import * as LineActions from '../src/actions/lineStep';
import * as AppActions from '../src/actions/app';
import {ImmutableChecker} from './testUtils';
import * as TestData from './data';
import {objectAssign} from '../src/utils';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

function chainActions(actions = [], initialState = reducer(undefined, {})) {
    return actions.reduce((state, action) => reducer(state, action), initialState);
}

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.include({
            tool: 'edit',
            lines: [],
            stale: true
        });
    });

    it('should set tool', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, StepActions.setTool('line', 'edit'))).to.deep.include({
            tool: 'edit'
        });

        expect(checker.check()).to.be.true;
    });

    it('should set stale in response to setCorners', () => {
        let state = chainActions();
        checker.setState(state);
        const corners = [[0, 0], [500, 0], [0, 1000], [500, 1000]];

        expect(reducer(state, CornerActions.setCorners(corners))).to.deep.include({
            stale: true
        });

        expect(checker.check()).to.be.true;
    });

    it('should set lines', () => {
        const corners = [[0, 0], [500, 0], [0, 1000], [500, 1000]];

        let state = chainActions([CornerActions.setCorners(corners)]);
        checker.setState(state);
        const lines = [[[0, 10], [50, 200]]];

        expect(reducer(state, LineActions.setLines(lines))).to.deep.include({
            lines,
            stale: false
        });

        expect(checker.check()).to.be.true;
    });

    it('should reset', () => {
        const lines = [[[0, 10], [50, 200]]];
        let state = chainActions([LineActions.setLines(lines)]);

        checker.setState(state);

        expect(reducer(state, AppActions.reset())).to.deep.include({
            lines: [],
            stale: true
        });

        expect(checker.check()).to.be.true;
    });

});

const initialState = {
    app: {
        workflow: TestData.workflow,
        subject: {
            id: TestData.subject.id,
            imageData: {
                src: TestData.subject.imageData.src,
                width: TestData.img.naturalWidth,
                height: TestData.img.naturalHeight
            }
        }
    },
    steps: {
        corner: {
            corners: TestData.corners
        }
    }
};

describe('computeLines', () => {
    it('should compute lines from corners', () => {
        const store = storeCreator(initialState);

        store.dispatch(LineActions.computeLines());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.have.property('type', 'SET_LINES');
        expect(actions[0].lines).to.deep.equal(TestData.lines);
    });

    it('should throw error if too few corners', () => {
        const state = objectAssign({}, initialState);
        state.steps.corner.corners = [[30, 118], [1453, 102], [65, 1961]];
        const store = storeCreator(initialState);

        expect(() => store.dispatch(LineActions.computeLines())).to.throw('Too few circles. Please draw 4 circles, one at each corner of the table.');
    });

    it('should throw error if too many corners', () => {
        const state = objectAssign({}, initialState);
        state.steps.corner.corners = [[30, 118], [1453, 102], [65, 1961], [1485, 1926], [45, 786]];
        const store = storeCreator(initialState);

        expect(() => store.dispatch(LineActions.computeLines())).to.throw('Too many circles. Please draw 4 circles, one at each corner of the table.');
    });


});
