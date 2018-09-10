import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Item, FullImageItem} from './scene';
import ImageViewer from './ImageViewer';
import Step from './Step';
import {ToolButton, ToolButtonGroup} from './DrawingTools';
import {switchOn, cloneArray} from '../utils';
import {extendPropTypes, extendMapStateToProps, pickProps} from './componentUtils';
import CornerInstructions from './CornerInstructions';
import Error from './Error';
import {setCorners} from '../actions/cornerStep';

function CornerStepTools(props) {
    return (
        <ToolButtonGroup {...props} >
            <ToolButton title={'Draw'} value={'draw'} />
            <ToolButton title={'Edit'} value={'edit'} />
            <ToolButton title={'Delete'} value={'delete'} />
        </ToolButtonGroup>
    );
}

CornerStepTools.propTypes = ToolButtonGroup.propTypes;

class CornerItem extends Item {
    constructor(pos) {
        super(null);
        this.pos = cloneArray(pos);
        this.zIndex = 1;
    }

    draw(ctx) {
        const pos = this.scene.toScene(this.pos);
        const r = 4;
        ctx.save();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], r, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore()
    }

    moveBy(delta) {
        this.pos = [this.pos[0] + delta[0], this.pos[1] + delta[1]];
    }

    moveTo(pos) {
        this.pos = cloneArray(pos);
    }

    hitTest(pt) {
        const dx = this.pos[0] - pt[0];
        const dy = this.pos[1] - pt[1];
        return Math.sqrt(dx * dx + dy * dy) < 10.0;
    }
}

class CornerViewer extends ImageViewer {
    constructor(props) {
        super(props);
        this.dragItem = null;
        this.lastMousePos = null;
    }

    renderScene() {
        this.scene.clear();
        this.scene.addItem(new FullImageItem(this.props.img));

        this.props.corners.forEach(pos => {
            this.scene.addItem(new CornerItem(pos));
        });
    }

    setCorners() {
        const corners = this.scene.getItems(CornerItem).map(item => item.pos);
        this.props.dispatch(setCorners(corners));
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        if (prevProps.corners !== this.props.corners) {
            this.scene.clear();
            this.renderScene();
            this.scene.update();
        }
    }

    getCursor() {
        switch (this.props.tool) {
            case 'draw':
                return 'crosshair';
            case 'edit':
                return 'default';
            case 'delete':
                return 'not-allowed';
        }
    }

    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);
        this.lastMousePos = mousePos;

        switchOn(this.props.tool, {
            'draw': () => {
                this.scene.addItem(new CornerItem(mousePos));
                this.setCorners();
            },
            
            'edit': () => {
                const item = this.scene.itemAt(mousePos);
                if (item instanceof CornerItem) {
                    this.dragItem = item;
                    this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
                }
            },

            'delete': () => {
                const item = this.scene.itemAt(mousePos);
                if (item instanceof CornerItem) {
                    this.scene.removeItem(item);
                    this.setCorners();
                }
            }
        });
    }

    handleMouseUp() {
        switchOn(this.props.tool, {
            'edit': () => {
                if (this.dragItem) {
                    this.dragItem = null;
                    this.canvasRef.removeEventListener('mousemove', this.handleMouseMove);
                    this.setCorners();
                }
            }
        });
    }

    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);

        switchOn(this.props.tool, {
            'edit': () => {
                this.dragItem.moveBy([mousePos[0] - this.lastMousePos[0], mousePos[1] - this.lastMousePos[1]]);
                this.lastMousePos = mousePos;
                this.scene.update(); // must update scene manually since no action dispatched for move
            }
        });
    }
}

CornerViewer.propTypes = extendPropTypes(ImageViewer.propTypes, {
    tool: PropTypes.string.isRequired,
    corners: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
});

class CornerStep extends React.Component {
    render() {
        return (
            <Step {...pickProps(Step, this.props)} >
                <CornerInstructions key='instructions' {...pickProps(CornerInstructions, this.props)} />
                <Error key='error' {...pickProps(Error, this.props)} />
                <CornerStepTools key='tools' {...pickProps(CornerStepTools, this.props)} />
                <CornerViewer key='viewer' {...pickProps(CornerViewer, this.props)} />
            </Step>
        );
    }
}

CornerStep.propTypes = extendPropTypes(Step.propTypes, {
    corners: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    tool: PropTypes.string.isRequired
});

const mapStateToProps = extendMapStateToProps(Step.mapStateToProps, function(storeState) {
    const {tool, corners} = storeState.steps.corner;
    return {tool, corners};
});

export default connect(
    mapStateToProps
)(CornerStep);
