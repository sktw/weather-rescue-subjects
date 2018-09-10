import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Item, FullImageItem} from './scene';
import ImageViewer from './ImageViewer';
import Step from './Step';
import {ToolButton, ToolButtonGroup} from './DrawingTools';
import {switchOn, cloneArray} from '../utils';
import {extendPropTypes, extendMapStateToProps, pickProps} from './componentUtils';
import LineInstructions from './LineInstructions';
import Error from './Error';
import {setLines} from '../actions/lineStep';

function LineStepTools(props) {
    return (
        <ToolButtonGroup {...props} >
            <ToolButton title={'Edit'} value={'edit'} />
        </ToolButtonGroup>
    );
}

LineStepTools.propTypes = ToolButtonGroup.propTypes;

class ControlPointItem extends Item {
    constructor(parnt, pos) {
        super(parnt);
        this.pos = cloneArray(pos);
        this.zIndex = 2;
    }

    draw(ctx) {
        const pos = this.scene.toScene(this.pos);
        const r = 4;
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(pos[0] - r, pos[1] - r, 2 * r, 2 * r);
        ctx.stroke();
        ctx.restore()
    }

    moveBy(delta) {
        const [dx, dy] = delta;
        const [x, y] = this.pos;
        this.pos = [x + dx, y + dy];
    }

    moveTo(pos) {
        this.pos = cloneArray(pos);
    }

    hitTest(pt) {
        var dx = this.pos[0] - pt[0];
        var dy = this.pos[1] - pt[1];
        return Math.sqrt(dx * dx + dy * dy) < 10.0;
    }
}

class LineItem extends Item {
    constructor(start, end) {
        super(null);
        this.startItem = new ControlPointItem(this, start);
        this.endItem = new ControlPointItem(this, end);
        this.children = [this.startItem, this.endItem];
        this.zIndex = 1;
    }

    draw(ctx) {
        const start = this.scene.toScene(this.children[0].pos);
        const end = this.scene.toScene(this.children[1].pos);
        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke();
        ctx.restore()
    }

    hitTest() {
        return false;
    }
}

function getClosestPointOnRect(pos, rect) {
    const [x, y]  = pos;
    const [tl, br] = rect;
    const [x0, y0] = tl;
    const [x1, y1] = br;

    let d;
    const candidates = [];

    if (y < y0) { // above rect
        if (x < x0) {
            d = Math.sqrt((y - y0) * (y - y0) + (x - x0) * (x - x0));
            candidates.push([d, [x0, y0]]);
        }
        else if (x > x1) {
            d = Math.sqrt((y - y0) * (y - y0) + (x - x1) * (x - x1));
            candidates.push([d, [x1, y0]]);
        }
        else {
            d = y0 - y;
            candidates.push([d, [x, y0]]);
        }

    }
    else if (y > y1) { // below rect
        if (x < x0) {
            d = Math.sqrt((y - y1) * (y - y1) + (x - x0) * (x - x0));
            candidates.push([d, [x0, y1]]);
        }
        else if (x > x1) {
            d = Math.sqrt((y - y1) * (y - y1) + (x - x1) * (x - x1));
            candidates.push([d, [x1, y1]]);
        }
        else {
            d = y1 - y;
            candidates.push([d, [x, y1]]);
        }
    }
    else { // between top and bottom
        if (x < x0) {
            d = x0 - x;
            candidates.push([d, [x0, y]]);
        }
        else if (x > x1) {
            d = x - x1;
            candidates.push([d, [x1, y]]);
        }
        else {
            d = x - x0;
            candidates.push([d, [x0, y]]);
            d = x1 - x;
            candidates.push([d, [x1, y]]);
            d = y - y0;
            candidates.push([d, [x, y0]]);
            d = y1 - y;
            candidates.push([d, [x, y1]]);
        }
    }

    return candidates.reduce(([dMin, posMin], [d, pos]) => {
        return d < dMin ? [d, pos] : [dMin, posMin];
    }, [Infinity, null]);
}

class LineViewer extends ImageViewer {
    constructor(props) {
        super(props);
        this.dragItem = null;
    }

    renderScene() {
        this.scene.clear();
        this.scene.addItem(new FullImageItem(this.props.img));

        this.props.lines.forEach(([start, end]) => {
            const item = new LineItem(start, end);
            this.scene.addItem(item);
        });
    }

    setLines() {
        const lines = this.scene.getItems(LineItem).map(item => {
            const start = item.startItem.pos;
            const end = item.endItem.pos;
            return [start, end];
        });

        this.props.dispatch(setLines(lines));
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        if (prevProps.lines !== this.props.lines) {
            this.scene.clear();
            this.renderScene();
            this.scene.update();
        }
    }

    getCursor() {
        switch (this.props.tool) {
            case 'edit':
                return 'default';
        }
    }

    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);

        switchOn(this.props.tool, {
            'edit': () => {
                const item = this.scene.itemAt(mousePos);
                if (item instanceof ControlPointItem) {
                    this.dragItem = item;
                    this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
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
                    this.setLines();
                }
            }
        });
    }

    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);

        switchOn(this.props.tool, {
            'edit': () => {
                const rect = this.getImageRect();
                const [,pos] = getClosestPointOnRect(mousePos, rect);

                this.dragItem.moveTo(pos);
                this.scene.update();
            }
        });

   }

}

LineViewer.propTypes = extendPropTypes(ImageViewer.propTypes, {
    lines: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
    tool: PropTypes.string.isRequired
});

class LineStep extends React.Component {
    render() {
        return (
            <Step {...pickProps(Step, this.props)} >
                <LineInstructions key='instructions' {...pickProps(LineInstructions, this.props)} />
                <Error key='error' {...pickProps(Error, this.props)} />
                <LineStepTools key='tools' {...pickProps(LineStepTools, this.props)} />
                <LineViewer key='viewer' {...pickProps(LineViewer, this.props)} />
            </Step>
        );
    }
}

LineStep.propTypes = extendPropTypes(Step.propTypes, {
    tool: PropTypes.string.isRequired,
    lines: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))).isRequired,
});

const mapStateToProps = extendMapStateToProps(Step.mapStateToProps, function(storeState) {
    const {tool, lines} = storeState.steps.line;
    return {tool, lines};
});

export default connect(
    mapStateToProps
)(LineStep);
