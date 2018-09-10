import React from 'react';
import PropTypes from 'prop-types';
import {classList} from '../utils';
import {renderBlock} from './componentUtils';
import {taskNext, taskBack} from '../actions/app';

class Instructions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {helpOpen: false, examplesOpen: false};
        this.handleNext = this.handleNext.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleInstructionsToggle = this.handleInstructionsToggle.bind(this);
    }

    render() {
        const iconClass = open => classList([
            ['fa', true],
            ['fa-chevron-down', open],
            ['fa-chevron-right', !open]
        ]);

        const {renderNext=true, renderBack=true, nextTitle='Next', enableNext=true, children, stepTitle, stepSubtitle=''} = this.props;
        const {helpOpen, examplesOpen} = this.state;
        const helpBlock = renderBlock(children, 'help');
        const examplesBlock = renderBlock(children, 'examples');

        return (
            <div className="instructions">
                <div className="instructions-box">
                    <h3>{stepTitle}</h3>
                    {stepSubtitle === '' ? null : <h4>{stepSubtitle}</h4>}
                    {renderBlock(children, 'instructions')}
                    {helpBlock === null ? null :
                        <div className="instructions-section">
                            <a 
                                href="#" 
                                className="instructions-toggle" 
                                onClick={e => this.handleInstructionsToggle(e, 'help')}
                            >Help <i className={iconClass(helpOpen)} ></i></a>
                            {!helpOpen ? null :
                                <div className="instructions-body">
                                    {helpBlock}
                                </div>
                            }
                        </div>
                    }
                    {examplesBlock === null ? null :
                        <div className="instructions-section">
                            <a 
                                href="#" 
                                className="instructions-toggle" 
                                onClick={e => this.handleInstructionsToggle(e, 'examples')}
                            >Examples <i className={iconClass(examplesOpen)} ></i></a>
                            {!examplesOpen ? null :
                                <div className="instructions-body">
                                    {examplesBlock}
                                </div>
                            }
                        </div>
                    }
                    <hr className="w-100" />
                    <div>
                        {renderBack ? <button className="btn btn-secondary mr-1" onClick={this.handleBack}>Back</button> : null}
                        {renderNext ? <button className="btn btn-success" disabled={!enableNext} onClick={this.handleNext}>{nextTitle}</button> : null}
                    </div>

                </div>
            </div>
        );

    }

    handleNext() {
        this.props.dispatch(taskNext());
    }

    handleBack() {
        this.props.dispatch(taskBack());
    }

    handleInstructionsToggle(e, name) {
        e.preventDefault();

        switch (name) {
            case 'help':
                this.setState({helpOpen: !this.state.helpOpen});
                break;

            case 'examples':
                this.setState({examplesOpen: !this.state.examplesOpen});
                break;
        }
    }
}

Instructions.propTypes = {
    dispatch: PropTypes.func.isRequired,
    stepTitle: PropTypes.string.isRequired,
    stepSubtitle: PropTypes.string,
    renderNext: PropTypes.bool,
    renderBack: PropTypes.bool,
    nextTitle: PropTypes.string,
    enableNext: PropTypes.bool,
    children: PropTypes.any,
};

export default Instructions;
