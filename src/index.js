import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import rootReducer from './reducers';
import App from './components/App';
import {fetchImage, fetchSubject, fetchWorkflow} from './actions/app';

const middleware = [thunk];

if (process.env.NODE_ENV !== 'production') {
    const logger = require('redux-logger').default;
    middleware.push(logger);
}

const store = createStore(rootReducer, applyMiddleware(...middleware));

store.dispatch(fetchWorkflow()
    ).then(() => store.dispatch(fetchSubject())
    ).then(() => store.dispatch(fetchImage())
    ).catch(err => console.error(err));

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);
