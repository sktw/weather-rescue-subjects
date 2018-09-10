import {objectAssign} from '../utils';

function getInitialState() {
    return {
        workflow: null,
        subject: null,
        img: null,
        taskIndex: -1,
        task: null,
        tasks: [],
        classificationsComplete: false
    };
}

function createTasks(workflow) {
    const {rows, columns} = workflow.template;
    const segmentCount = rows * (columns - 1);
    const segmentSteps = [];

    for (let i = 0; i < segmentCount; i++) {
        segmentSteps.push({step: 'segment', segmentIndex: i});
    }

    return [
        {step: 'corner'},
        {step: 'line'}
    ].concat(segmentSteps).concat([
        {step: 'summary'}
    ]);
}

function setWorkflow(state, action) {
    const {workflow} = action;
    const tasks = createTasks(workflow);

    return objectAssign({}, state, {workflow: workflow, tasks, task: tasks[0], taskIndex: 0});
}

function setSubject(state, action) {
    return objectAssign({}, state, {subject: action.subject});
}

function setImage(state, action) {
    const img = action.img;
    const imageData = objectAssign({}, state.subject.imageData, {width: img.naturalWidth, height: img.naturalHeight});
    const subject = objectAssign({}, state.subject, {imageData});
    return objectAssign({}, state, {img: action.img, subject});
}

function taskNext(state) {
    const taskIndex = state.taskIndex + 1;
    return objectAssign({}, state, {taskIndex, task: state.tasks[taskIndex]});
}

function taskBack(state) {
    const taskIndex = state.taskIndex - 1;
    return objectAssign({}, state, {taskIndex, task: state.tasks[taskIndex]});
}

function reset(state) {
    const {tasks} = state;
    return objectAssign({}, state, {taskIndex: 0, task: tasks[0], subject: null, img: null});
}

function classificationsComplete(state) {
    return objectAssign({}, state, {classificationsComplete: true});
}

function reducer(state = getInitialState(), action) {
    switch (action.type) {
        case 'TASK_NEXT':
            return taskNext(state);

        case 'TASK_BACK':
            return taskBack(state);
        
        case 'SET_WORKFLOW':
            return setWorkflow(state, action);

        case 'SET_SUBJECT':
            return setSubject(state, action);

        case 'SET_IMAGE':
            return setImage(state, action);

        case 'RESET':
            return reset(state);

        case 'CLASSIFICATIONS_COMPLETE':
            return classificationsComplete(state);
 
        default:
            return state;
    }
}

export default reducer;
