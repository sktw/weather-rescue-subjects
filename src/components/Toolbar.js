import React from 'react';
import PropTypes from 'prop-types';
import {setZoomValue, applyRotation} from '../actions/step';

const zoomOptions = [
    ['actual-size', 'Actual Size'],
    ['fit-page', 'Fit Page'],
    ['fit-width', 'Fit Width'],
];

const percentageOptions = [
    [10, false],
    [20, false],
    [30, false],
    [40, false],
    [50, true],
    [60, false],
    [70, false],
    [80, false],
    [90, false],
    [100, true],
    [120, false],
    [140, false],
    [160, false],
    [180, false],
    [200, true],
    [230, false],
    [260, false],
    [290, false],
    [320, false],
    [360, false],
    [400, false],
    [450, false],
    [500, false],
];

class Toolbar extends React.Component {
    constructor(props) {
        super(props);
        this.handleZoomOut = this.handleZoomOut.bind(this);
        this.handleZoomIn = this.handleZoomIn.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.handleRotateClockwise = this.handleRotateClockwise.bind(this);
        this.handleRotateAnticlockwise = this.handleRotateAnticlockwise.bind(this);
    }

    render() {
        const {zoomValue, zoomPercentage} = this.props;

        const [minZoom] = percentageOptions[0];
        const [maxZoom] = percentageOptions[percentageOptions.length - 1];

        return (
            <nav className="menu-button-bar">
                <div className="menu-button-group">
                    <button className="menu-button" type="button" title="Zoom out" onClick={this.handleZoomOut} disabled={zoomPercentage <= minZoom}>
                        <i className="fa fa-minus" />
                    </button>
                    <button className="menu-button" type="button" title="Zoom in" onClick={this.handleZoomIn} disabled={zoomPercentage >= maxZoom}>
                        <i className="fa fa-plus" />
                    </button>
                    <select className="menu-control zoom-select" title="Zoom" value={zoomValue} onChange={this.handleZoom}>{
                        zoomOptions.map(([value, label]) => {
                            return <option key={value} value={value}>{label}</option>;
                        }).concat(
                        percentageOptions.map(([value, enabled]) => {
                            const label = value + '%';

                            return <option key={value} value={value} disabled={!enabled} hidden={!enabled}>{label}</option>;
                        }))
                    }
                    </select>
                </div>
                <div className="menu-button-group">
                    <button className="menu-button" type="button" title="Rotate anticlockwise" onClick={this.handleRotateAnticlockwise}>
                        <i className="fa fa-rotate-left" />
                    </button>
                    <button className="menu-button" type="button" title="Rotate clockwise" onClick={this.handleRotateClockwise}>
                        <i className="fa fa-rotate-right" />
                    </button>
                </div>
 
                {this.props.children}
            </nav>
        );
    }

    handleZoomIn() {
        var zoomValue = '';

        for (let i = 0; i < percentageOptions.length; i++) {
            const [value] = percentageOptions[i];

            if (value > this.props.zoomPercentage) {
                zoomValue = value + '';
                break;
            }
        }

        this.props.dispatch(setZoomValue(this.props.step, zoomValue));
    }

    handleZoomOut() {
        var zoomValue = '';

        for (let i = percentageOptions.length - 1; i >= 0; i--) {
            const [value] = percentageOptions[i];

            if (value < this.props.zoomPercentage) {
                zoomValue = value + '';
                break;
            }
        }

        this.props.dispatch(setZoomValue(this.props.step, zoomValue));
    }

    handleZoom(e) {
        this.props.dispatch(setZoomValue(this.props.step, e.target.value));
    }

    handleRotateClockwise() {
        this.props.dispatch(applyRotation(this.props.step, 1));
    }

    handleRotateAnticlockwise() {
        this.props.dispatch(applyRotation(this.props.step, -1));
    }
}

Toolbar.propTypes = {
    step: PropTypes.string.isRequired,
    zoomValue: PropTypes.string.isRequired,
    zoomPercentage: PropTypes.number.isRequired,
    children: PropTypes.node,
    dispatch: PropTypes.func.isRequired
};

export default Toolbar;
