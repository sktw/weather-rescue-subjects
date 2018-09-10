import {expect} from 'chai';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import reducer from '../src/reducers/app';
import * as AppActions from '../src/actions/app';
import {ImmutableChecker, mockFetch, createJSONResponse} from './testUtils';
import * as TestData from './data';
import {objectAssign} from '../src/utils';

const checker = new ImmutableChecker();
const storeCreator = configureStore([thunk]);

function chainActions(actions = [], initialState = reducer(undefined, {})) {
    return actions.reduce((state, action) => reducer(state, action), initialState);
}

describe('reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).to.deep.equal({
            workflow: null,
            subject: null,
            img: null,
            taskIndex: -1,
            task: null,
            tasks: [],
            classificationsComplete: false
        });
    });

    it('should set workflow', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, AppActions.setWorkflow(TestData.workflow))).to.deep.include({
            workflow: TestData.workflow,
            tasks: TestData.tasks,
            task: TestData.tasks[0],
            taskIndex: 0
        });

        expect(checker.check()).to.be.true;
    });

    it('should set subject', () => {
        let state = chainActions();
        checker.setState(state);

        expect(reducer(state, AppActions.setSubject(TestData.subject))).to.deep.include({
            subject: TestData.subject
        });

        expect(checker.check()).to.be.true;
    });

    it('should set image', () => {
        let state = chainActions([AppActions.setSubject(TestData.subject)]);
        checker.setState(state);

        expect(reducer(state, AppActions.setImage(TestData.img))).to.deep.include({
            img: TestData.img,
            subject: {
                id: TestData.subject.id,
                imageData: {
                    src: TestData.subject.imageData.src,
                    width: TestData.img.naturalWidth,
                    height: TestData.img.naturalHeight
                }
            }
        });

        expect(checker.check()).to.be.true;
    });

    it('should set next task', () => {
        let state = chainActions([AppActions.setWorkflow(TestData.workflow)]);
        checker.setState(state);

        expect(reducer(state, AppActions.setTaskNext())).to.deep.include({
            taskIndex: 1,
            task: TestData.tasks[1]
        });

        expect(checker.check()).to.be.true;
    });

    it('should set back task', () => {
        let state = chainActions([AppActions.setWorkflow(TestData.workflow), AppActions.setTaskNext()]);
        checker.setState(state);

        expect(reducer(state, AppActions.taskBack())).to.deep.include({
            taskIndex: 0,
            task: TestData.tasks[0]
        });

        expect(checker.check()).to.be.true;
    });

    it('should reset', () => {
        const lines = [[[0, 10], [50, 200]]];
        let state = chainActions([AppActions.setWorkflow(TestData.workflow), AppActions.setTaskNext()]);

        checker.setState(state);

        expect(reducer(state, AppActions.reset())).to.deep.include({
            workflow: TestData.workflow,
            taskIndex: 0,
            task: TestData.tasks[0],
            subject: null,
            img: null
        });

        expect(checker.check()).to.be.true;
    });

});

const initialState = {
    app: {
        workflow: TestData.workflow,
        subject: TestData.subject
    },
    steps: {
        corner: {
            corners: TestData.corners
        }
    }
};

describe('fetchImage', () => {
    it('should create and set src on image object', () => {
        global.Image = function() {
        };
        Object.defineProperty(global.Image.prototype, 'src', {
            set: function() {
                this.onload();
            }
        });

        const initialState = {
            app: {
                subject: TestData.subject
            }
        };

        const store = storeCreator(initialState);
        store.dispatch(AppActions.fetchImage());
        const actions = store.getActions();
        expect(actions).to.have.length(1);
        expect(actions[0]).to.have.property('type', 'SET_IMAGE');
    });
});

describe('fetchSubject', () => {
    it('should fetch subject', (done) => {
        global.Image = function() {
        };
        Object.defineProperty(global.Image.prototype, 'src', {
            set: function() {
                this.onload();
            }
        });

        global.fetch = mockFetch({resolve: createJSONResponse('200', {subject: TestData.subject})});

        const initialState = {
            app: {
                workflow: TestData.workflow
            }
        };

        const store = storeCreator(initialState);
        const result = store.dispatch(AppActions.fetchSubject());
        result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(1);
            expect(actions[0]).to.have.property('type', 'SET_SUBJECT');
            done();
        });
    });

    it('should dispatch classifications complete if no more queued subjects', (done) => {
        global.Image = function() {
        };
        Object.defineProperty(global.Image.prototype, 'src', {
            set: function() {
                this.onload();
            }
        });

        global.fetch = mockFetch({resolve: createJSONResponse('404', {})});

        const initialState = {
            app: {
                workflow: TestData.workflow
            }
        };

        const store = storeCreator(initialState);
        const result = store.dispatch(AppActions.fetchSubject());
        result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(1);
            expect(actions[0]).to.have.property('type', 'CLASSIFICATIONS_COMPLETE');
            done();
        });
    });
});

describe('fetchWorkflow', () => {
    it('should fetch workflow', (done) => {
        global.fetch = mockFetch({resolve: createJSONResponse('200', {workflow: TestData.workflow})});

        const initialState = {
            app: {
            }
        };

        const store = storeCreator(initialState);
        const result = store.dispatch(AppActions.fetchWorkflow());
        result.then(() => {
            const actions = store.getActions();
            expect(actions).to.have.length(1);
            expect(actions[0]).to.have.property('type', 'SET_WORKFLOW');
            done();
        });
    });

});

describe('submitClassification', () => {
    it('should submit classification', (done) => {
        const fetch = mockFetch({resolve: createJSONResponse(TestData.workflow)});
        global.fetch = fetch;

        const initialState = {
            app: {
                workflow: TestData.workflow,
                subject: TestData.subject
            },
            steps: {
                corner: {
                    corners: TestData.corners
                },
                line: {
                    lines: TestData.lines
                },
                segment: {
                    segments: TestData.segments,
                    segmentsOk: TestData.segmentsOk
                }
            }
        };

        const store = storeCreator(initialState);
        const result = store.dispatch(AppActions.submitClassification());
        result.then(() => {
            expect(fetch.calledOnce).to.be.true;
            const [url, init] = fetch.args[0];
            expect(url).to.equal('/api/classifications');
            expect(init).to.deep.include({
                method: 'POST'
            });
            done();
        }).catch(err => {
            console.error(err);
        })
    });

});


