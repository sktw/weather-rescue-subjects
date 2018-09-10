import {combineReducers} from 'redux';
import stepsReducer from './steps';
import appReducer from './app';

export default combineReducers({
    app: appReducer,
    steps: stepsReducer
});
