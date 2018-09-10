import React from 'react';
import {renderWithProps} from './componentUtils';
import {classList} from '../utils';
import PropTypes from 'prop-types';
import {setTool} from '../actions/step';

export class ToolButton extends React.Component {
    render() {
        const {value, title, tool, onChange} = this.props;
        const className = classList([['menu-button tool-button', true], ["active", value === tool]]);
        return (
            <button 
                className={className} 
                onClick={() => onChange(value)} 
                title={title}
            >{title}</button>
        );
    }
}

ToolButton.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    tool: PropTypes.string,
    onChange: PropTypes.func
};

export class ToolButtonGroup extends React.Component {
    constructor(props) {
        super(props);
        this.handleToolChange = this.handleToolChange.bind(this);
    }

    render() {
        const {tool} = this.props;
        return (
            <div className="menu-button-group">
                {renderWithProps(this.props.children, {onChange: this.handleToolChange, tool})}
            </div>
        );
    }

    handleToolChange(tool) {
        this.props.dispatch(setTool(this.props.step, tool));
    }
}

ToolButtonGroup.propTypes = {
    step: PropTypes.string.isRequired,
    tool: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.any
};
