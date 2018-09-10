import React from 'react';
import PropTypes from 'prop-types';
import {classList} from '../utils';
import Instructions from './Instructions';
import {setSegmentOk} from '../actions/segmentStep';
import {url} from '../utils';

function ToggleButton(props) {
    const className = classList([
        ['btn', true],
        [props.btnClass, true],
        ['active', props.value === props.segmentOk]
    ]);

    return (
        <label className={className}>
            <input type="radio" name={props.name} value={props.value} autoComplete="off" checked={props.value === props.segmentOk} onChange={props.onChange} /> {props.title}
        </label>
    );
}

ToggleButton.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    segmentOk: PropTypes.string.isRequired,
    btnClass: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

function SegmentInstructions(props) {
    const {title, segmentIndex, segmentOk} = props;

    const handleResponseChange = e => {
        props.dispatch(setSegmentOk(segmentIndex, e.target.value));
    };

    return (
        <Instructions stepTitle='Step 3' stepSubtitle={title} enableNext={segmentOk !== ''} {...props} >
            <div key='instructions'>
                <p>Make final adjustments to the subject image, then answer the following:</p>
                <p>Is the segment correctly segmented?</p>
                <div className="btn-group-toggle mb-3">
                    <ToggleButton btnClass="btn-outline-primary mr-1" name="response" value='y' title='Yes' segmentOk={segmentOk} onChange={handleResponseChange} />
                    <ToggleButton btnClass="btn-outline-primary" name="response" value='n' title='No' segmentOk={segmentOk} onChange={handleResponseChange} />
                </div>
            </div>
            <ul key='help'>
                <li>You only need to make adjustments if parts of the contents of the header and columns blocks are not visible, or the blocks are poorly aligned.</li>
                <li>Use the <b>Edit</b> tool to make adjustments to the borders of the header and columns blocks. These blocks are illustrated in the examples.
                    <ol>
                        <li>Click on the block to display the border lines and control points.</li>
                        <li>Click and drag the control points to adjust the borders. The image will update when you release the mouse.</li>
                    </ol>
                </li>
                <li>Use the <b>Move</b> tool to adjust the vertical alignment of the header and columns blocks.
                    <ul>
                        <li>Click on the block and drag it up or down to adjust the alignment.</li>
                    </ul>
                </li>
                <li>{"If you can't get a good segmentation, answer 'No' to the question in the instructions."}</li> 
            </ul>
            <ul key='examples'>
                <li>Header block
                    <div className="examples-image-container">
                        <img src={url("images/segment-step-header-block.jpg")} />
                    </div>
                </li>
                <li>Columns block
                    <div className="examples-image-container">
                        <img src={url("images/segment-step-columns-block.jpg")} />
                    </div>
                </li>
            </ul>

        </Instructions>
    );
}

SegmentInstructions.propTypes = {
    dispatch: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    segmentIndex: PropTypes.number.isRequired,
    segmentOk: PropTypes.string.isRequired
}

export default SegmentInstructions;
