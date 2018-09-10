import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Loading from './Loading';
import CornerStep from './CornerStep';
import LineStep from './LineStep';
import SegmentStep from './SegmentStep';
import SummaryStep from './SummaryStep';
import Complete from './Complete';
import {classList} from '../utils';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {navbarCollapsed: true};
        this.handleNavbarToggle = this.handleNavbarToggle.bind(this);
    }

    handleNavbarToggle() {
        this.setState({navbarCollapsed: !this.state.navbarCollapsed});
    }

    renderStep() {
        const {img, taskIndex, task, classificationsComplete} = this.props;

        if (classificationsComplete) {
            return <Complete />;
        }
        else if (img === null) {
            return <Loading />;
        }

        switch (task.step) {
            case 'corner':
                return <CornerStep step={'corner'} key={taskIndex} />;
            case 'line':
                return <LineStep step={'line'} key={taskIndex} />
            case 'segment':
                return <SegmentStep step={'segment'} key={taskIndex} />
            case 'summary':
                return <SummaryStep step={'summary'} key={taskIndex} />
        }
    }

    render() {
        const {navbarCollapsed} = this.state;
        const className = classList([
            ["navbar-collapse", true],
            ["collapse", navbarCollapsed]
        ]);

        return (
            <React.Fragment>
                <nav className="navbar navbar-expand-sm navbar-light bg-light" role="navigation">
                    <a className="navbar-brand" href="#">Weather Rescue Subjects</a>
                    <button className="navbar-toggler" type="button" onClick={this.handleNavbarToggle}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={className}>
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <a className="nav-link" href="#">Classify</a>
                            </li>
                        </ul>
                    </div>
                </nav>
                {this.renderStep()}
            </React.Fragment>
        );
    }
 
}

App.propTypes = {
    dispatch: PropTypes.func.isRequired,
    img: PropTypes.instanceOf(Element),
    taskIndex: PropTypes.number.isRequired,
    task: PropTypes.object,
    classificationsComplete: PropTypes.bool.isRequired
};

function mapStateToProps(storeState) {
    const {taskIndex, task, img, classificationsComplete} = storeState.app;
    return {taskIndex, task, img, classificationsComplete};
}

export default connect(
    mapStateToProps
)(App);
