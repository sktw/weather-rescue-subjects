import React from 'react';
import PropTypes from 'prop-types';
import Instructions from './Instructions';
import {url} from '../utils';

function CornerInstructions(props) {
    return (
        <Instructions stepTitle='Step 1' renderBack={false} {...props} >
            <p key='instructions'>Draw 4 circles, one in each corner of the table.</p>
            <ul key='help'>
                <li>Select the <b>Draw</b> tool, and click on the corners of the table to draw the circles. The examples show which corners need to be drawn. If a corner is not visible, just guess its position outside the image.</li>
                <li>Use the <b>Edit</b> tool to adjust the positions of the circles. Click on the circle and drag it to the correct position.</li>
                <li>Clicking on a circle with the <b>Delete</b> tool removes the circle.</li>
            </ul>
            <ul key='examples'>
                <li>Corner placement
                    <div className="examples-image-container">
                        <img src={url("images/corner-step-placement.jpg")} />
                    </div>
                </li>
            </ul>
        </Instructions>
    );
}

CornerInstructions.propTypes = {
    dispatch: PropTypes.func.isRequired
}

export default CornerInstructions;
