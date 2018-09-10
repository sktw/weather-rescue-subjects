import {setError, clearError} from './step';
import {computeLines} from './lineStep';
import {computeSegments} from './segmentStep';
import {switchOn} from '../utils';

export function setImage(img) {
    return {
        type: 'SET_IMAGE',
        img
    };
}

export function fetchImage() {
    return (dispatch, getState) => {
        const storeState = getState();
        const {subject} = storeState.app;
        if (subject === null) {
            return Promise.reject(new Error('subject not set'));
        }
        
        const {src} = subject.imageData;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                return resolve(img);
            };

            img.onerror = err => {
                return reject(err);
            };

            img.src = src;

        }).then(img => {
            dispatch(setImage(img));
        });
    }
}

export function setSubject(subject) {
    return {
        type: 'SET_SUBJECT',
        subject
    };
}

export function fetchSubject() {
    return (dispatch, getState) => {
        const storeState = getState();
        const {workflow} = storeState.app;
        if (workflow === null) {
            return Promise.reject(new Error('workflow not set'));
        }

        const workflowId = workflow.id;

        return fetch('/api/subjects/queued?workflowId=' + workflowId).then(response => {
            return response.json().then(json => Promise.resolve([response.status, json]))
        }).then(([status, json]) => {
            if (status === 200) {
                dispatch(setSubject(json.subject));
            }
            else if (status === 404) {
                // no more subjects for this workflow
                dispatch(classificationsComplete());
            }
            else {
                console.error(json.message);
            }
        });
    };
}

export function setWorkflow(workflow) {
    return {
        type: 'SET_WORKFLOW',
        workflow
    };
}

export function fetchWorkflow() {
    // fetch a workflow for the user

    return (dispatch) => {
        return fetch('/api/workflows/queued').then(response => {
            return response.json().then(json => Promise.resolve([response.ok, json]))
        }).then(([ok, json]) => {
            if (ok) {
                dispatch(setWorkflow(json.workflow));
            }
            else {
                console.error(json.message);
            }
        });
    };
}

export function reset() {
    return {
        type: 'RESET'
    };
}

export function submitClassification() {
    return (dispatch, getState) => {
        const storeState = getState();
        const subjectId = storeState.app.subject.id;
        const {corners} = storeState.steps.corner;
        const {lines} = storeState.steps.line;
        const {segments, segmentsOk} = storeState.steps.segment;
        const classification = {
            subjectId,
            corners,
            lines,
            segments,
            segmentsOk
        };

        return fetch('/api/classifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({classification})
        }).catch(err => {
            console.error(err);
            // TODO - save classification to local storage if post fails
        });
    };
}

export function setTaskNext() {
    return {
        type: 'TASK_NEXT'
    };
}

export function taskNext() {
    return (dispatch, getState) => {
        const storeState = getState();
        const {step} = storeState.app.task;
        let ok = true;

        switchOn(step, {
            'corner': () => {
                try {
                    if (storeState.steps.line.stale) {
                        dispatch(computeLines());
                    }
                }
                catch (e) {
                    ok = false;
                    dispatch(setError('corner', e.message));
                }
            },
            'line': () => {
                try {
                    if (storeState.steps.segment.stale) {
                        dispatch(computeSegments());
                    }
                }
                catch (e) {
                    ok = false;
                    dispatch(setError('line', e.message));
                }
            },
            'summary': () => {
                ok = false;
                dispatch(submitClassification()).finally(() => {
                    dispatch(reset());
                    return dispatch(fetchSubject()
                        ).then(() => dispatch(fetchImage())
                        ).catch(err => console.error(err))
                });
            }
        });

        if (ok) {
            dispatch(clearError(step));

            dispatch(setTaskNext());
        }
    }
}

export function taskBack() {
    return {
        type: 'TASK_BACK'
    };
}

export function classificationsComplete() {
    return {
        type: 'CLASSIFICATIONS_COMPLETE'
    };
}
