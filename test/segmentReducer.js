import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer from '../src/reducers/segmentStep';
import * as StepActions from '../src/actions/step';
import * as LineActions from '../src/actions/lineStep';
import * as SegmentActions from '../src/actions/segmentStep';
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
            segments: [],
            segmentsOk: [],
            stale: true
        });
    });

    it('should set tool', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, StepActions.setTool('segment', 'move'))).to.deep.include({
            tool: 'move'
        });

        expect(checker.check()).to.be.true;
    });

    it('should set stale in response to setLines', () => {
        let state = chainActions();
        checker.setState(state);
        const lines = [[[0, 10], [50, 200]]];

        expect(reducer(state, LineActions.setLines(lines))).to.deep.include({
            stale: true
        });

        expect(checker.check()).to.be.true;
    });

    it('should set segments', () => {
        const lines = [[[0, 10], [50, 200]]];

        let state = chainActions([LineActions.setLines(lines)]);
        checker.setState(state);

        const segments = [[[0, 100], [50, 200]], [[0, 150], [20, 305]]];
        expect(reducer(state, SegmentActions.setSegments(segments))).to.deep.include({
            segments,
            stale: false
        });

        expect(checker.check()).to.be.true;
    });

    it('should set segment', () => {
        const segments = [[[[0, 100], [50, 200]], [[0, 150], [20, 305]]]];
        let state = chainActions([SegmentActions.setSegments(segments)]);
        checker.setState(state);

        const segment = [[[0, 103], [60, 196]], [[1, 140], [20, 310]]];
        expect(reducer(state, SegmentActions.setSegment(0, segment))).to.deep.include({
            segments: [segment],
            stale: false
        });

        expect(checker.check()).to.be.true;
    });

    it('should set segment ok', () => {
        const segments = [[[[0, 100], [50, 200]], [[0, 150], [20, 305]]]];
        let state = chainActions([SegmentActions.setSegments(segments)]);
        checker.setState(state);

        expect(reducer(state, SegmentActions.setSegmentOk(0, 'y'))).to.deep.include({
            segmentsOk: ['y'],
            stale: false
        });

        expect(checker.check()).to.be.true;
    });

    it('should set segment ok', () => {
        const segments = [[[[0, 100], [50, 200]], [[0, 150], [20, 305]]]];
        let state = chainActions([SegmentActions.setSegments(segments)]);
        checker.setState(state);

        expect(reducer(state, AppActions.reset())).to.deep.include({
            segments: [],
            segmentsOk: [],
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
        },
        line: {
            lines: TestData.lines
        }
    }
};

describe('computeSegments', () => {
    it('should compute segments from lines', () => {
        const store = storeCreator(initialState);

        store.dispatch(SegmentActions.computeSegments());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.have.property('type', 'SET_SEGMENTS');
        expect(actions[0].segments).to.deep.equal(TestData.segments);
    });

    it('should throw error if number of horizontal/vertical lines incorrect', () => {
        const state = objectAssign({}, initialState);
        state.steps.line.lines = [
             [[76,0],[116,2069]],
             [[279,0],[317,2069]],
             [[587,0],[625,2069]],
             [[1105,0],[1142,2069]],
             [[1451,0],[1488,2069]],
             [[0,307],[1602,287]],
             [[0,642],[1602,618]],
             [[0,939],[1602,911]],
             [[0,1208],[1602,1177]],
             [[0,1358],[1602,1325]],
             [[0,1704],[1602,1668]],
             [[1963, 0],[1923, 1602]] // swap x-y to make last line vertical rather than horizontal
        ];

        const store = storeCreator(initialState);
        const {rows, columns} = state.app.workflow.template;

        expect(() => store.dispatch(SegmentActions.computeSegments())).to.throw('Incorrect number of horizontal and vertical lines - there should be ' + (rows + 1) +' horizontal and ' + (columns + 1) + ' vertical lines.');
    });
});
