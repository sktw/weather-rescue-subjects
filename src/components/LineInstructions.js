import React from 'react';
import PropTypes from 'prop-types';
import Instructions from './Instructions';
import {url} from '../utils';

function LineInstructions(props) {
    return (
        <Instructions stepTitle='Step 2' {...props} >
            <p key='instructions'>Adjust the lines to segment the page.</p>;
            <ul key='help'>
                <li>Using the <b>Edit</b> tool, click on the control squares and drag them to adjust the lines. The examples show where the segmenting lines should be.</li>
                <li>The control squares will only move along the edge of the image.</li>
                <li>The scaling and rotation tools will enable you to see the whole length of the lines.</li>
                <li>Don&#39;t worry if you can&#39;t get a good fit all the way along a line; you will be able to adjust each block individually in step 3.</li>
            </ul>
            <ul key='examples'>
                <li>Line placement
                    <div className="examples-image-container">
                        <img src={url("images/line-step-placement.jpg")} />
                    </div>
                </li>
            </ul>

        </Instructions>
    );
}

LineInstructions.propTypes = {
    dispatch: PropTypes.func.isRequired
}

export default LineInstructions;
