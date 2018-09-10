import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from './Toolbar';
import {renderBlock, pickProps} from './componentUtils';

class Step extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {subjectTitle, children, error} = this.props;
        return (
            <div className="wrapper">
                <h2>Subject date: {subjectTitle}</h2>
                {renderBlock(children, 'instructions')}
                {error !== null ? renderBlock(children, 'error') : null}
                <div className="outer-container">
                    <div className="main-container">
                        <Toolbar {...pickProps(Toolbar, this.props)}>
                            {renderBlock(children, 'tools')}
                        </Toolbar>
                        {renderBlock(children, 'viewer')}
                    </div>
                </div>
            </div>
        );
    }
}

Step.propTypes = {
    subjectTitle: PropTypes.string.isRequired,
    step: PropTypes.string.isRequired,
    zoomValue: PropTypes.string.isRequired,
    zoomPercentage: PropTypes.number.isRequired,
    error: PropTypes.string,
    imageData: PropTypes.object.isRequired,
    img: PropTypes.instanceOf(Element).isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.any
};

Step.mapStateToProps = function(storeState, props) {
    const subjectTitle = storeState.app.subject.title;
    const stepState = storeState.steps[props.step];
    const {zoomValue, zoomPercentage, rotation, error} = stepState;
    const {img, subject} = storeState.app;
    const {imageData} = subject;

    return {subjectTitle, zoomValue, zoomPercentage, rotation, error, img, imageData};
}

export default Step;
