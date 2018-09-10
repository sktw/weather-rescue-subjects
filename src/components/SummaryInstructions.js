import React from 'react';
import PropTypes from 'prop-types';
import Instructions from './Instructions';

function SummaryInstructions(props) {
    return (
        <Instructions stepTitle='Summary' nextTitle='Done' {...props} >
            <p key='instructions'>Here&#39;s a summary of your work.</p>
        </Instructions>
    );
}

SummaryInstructions.propTypes = {
    dispatch: PropTypes.func.isRequired
}

export default SummaryInstructions;
