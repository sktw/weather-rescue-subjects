import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Item} from './scene';
import ImageViewer from './ImageViewer';
import Step from './Step';
import {ToolButton, ToolButtonGroup} from './DrawingTools';
import {switchOn} from '../utils';
import {extendPropTypes, extendMapStateToProps, pickProps} from './componentUtils';
import {add, subtract, scale, rectSize, rectMidpoints, rectContainsPoint, rectTranslate, rectTop, rectBottom} from '../geometry';
import SegmentInstructions from './SegmentInstructions';
import Error from './Error';
import {setSegment} from '../actions/segmentStep';

function SegmentStepTools(props) {
    return (
        <ToolButtonGroup {...props}>
            <ToolButton title={'Edit'} value={'edit'} />
            <ToolButton title={'Move'} value={'move'} />
        </ToolButtonGroup>
    );
}

SegmentStepTools.propTypes = ToolButtonGroup.propTypes;

export class SegmentImageItem extends Item {
    constructor(img, pos, rect, name) {
        super(null);
        this.img = img;
        this.pos = pos; // position of block in scene
        this.rect = rect; // location of block in original image
        this.name = name;
    }

    draw(ctx) {
        const [tl] = this.rect;
        const pos = this.scene.toScene(this.pos);
        const [x0, y0] = tl;
        const [width, height] = rectSize(this.rect);
        const size = this.scene.sizeToScene([width, height]);

        ctx.save();
        ctx.drawImage(this.img, x0, y0, width, height, pos[0], pos[1], size[0], size[1]);
        ctx.restore()
    }

    getRect() {
        const size = rectSize(this.rect);
        return [this.pos, add(this.pos, size)];
    }

    scrollBy(delta) {
        this.rect = rectTranslate(this.rect, scale(delta, -1));
    }

    hitTest(pt) {
        const size = rectSize(this.rect);
        const rect = [this.pos, add(this.pos, size)];
        return rectContainsPoint(rect, pt);
    }
}

class ControlPointItem extends Item {
    constructor(parnt, pos, orientation) {
        super(parnt);
        this.pos = pos;
        this.orientation = orientation;
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
        this.parnt.moveControlPointBy(this, delta);
    }

    hitTest(pt) {
        var dx = this.pos[0] - pt[0];
        var dy = this.pos[1] - pt[1];
        return Math.sqrt(dx * dx + dy * dy) < 10.0;
    }
}

class BlockItem extends Item {
    constructor(rect, name) {
        super(null);
        this.name = name;
        const midpoints = rectMidpoints(rect);

        this.tItem = new ControlPointItem(this, midpoints[0], 'horizontal');
        this.bItem = new ControlPointItem(this, midpoints[1], 'horizontal');
        this.lItem = new ControlPointItem(this, midpoints[2], 'vertical');
        this.rItem = new ControlPointItem(this, midpoints[3], 'vertical');

        this.children = [this.tItem, this.bItem, this.lItem, this.rItem];
        this.zIndex = 1;
        this.setVisible(false);
    }

    getRect() {
        const tl = [this.lItem.pos[0], this.tItem.pos[1]];
        const br = [this.rItem.pos[0], this.bItem.pos[1]];
        return [tl, br];
    }

    setTop(value) {
        const [x] = this.tItem.pos;
        this.tItem.pos = [x, value];
    }

    setBottom(value) {
        const [x] = this.bItem.pos;
        this.bItem.pos = [x, value];
    }

    moveBy(delta) {
        this.tItem.pos = add(this.tItem.pos, delta);
        this.bItem.pos = add(this.bItem.pos, delta);
        this.lItem.pos = add(this.lItem.pos, delta);
        this.rItem.pos = add(this.rItem.pos, delta);
    }

    draw(ctx) {
        const corners = this.getRect();
        const [tl] = corners;
        const [x0, y0] = this.scene.toScene(tl);
        const [w, h] = this.scene.sizeToScene(rectSize(corners));

        ctx.save();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x0, y0, w, h);
        ctx.stroke();
        ctx.restore()
    }

    moveControlPointBy(item, delta) {
        item.pos = add(item.pos, delta);

        const [tl, br] = this.getRect();
        const [x0, y0] = tl;
        const [x1, y1] = br;
        
        // ensure that item labels are correct

        if (x0 > x1) {
            [this.lItem, this.rItem] = [this.rItem, this.lItem];
        }
        if (y0 > y1) {
            [this.tItem, this.bItem] = [this.bItem, this.tItem];
        }

        const midpoints = rectMidpoints([tl, br]);

        this.tItem.pos = midpoints[0];
        this.bItem.pos = midpoints[1];
        this.lItem.pos = midpoints[2];
        this.rItem.pos = midpoints[3];
    }

    hitTest() {
        return false;
    }
}

class SegmentViewer extends ImageViewer {
    constructor(props) {
        super(props);
        this.dragItem = null;
        this.selectedBlockName = '';
        this.blockItems = {};
        this.imageItems = {};
    }

    renderBlock(block, pos, name) {
        const size = rectSize(block);
        const imageItem = new SegmentImageItem(this.props.img, pos, block, name);
        const blockItem = new BlockItem([pos, add(pos, size)], name);
        this.scene.addItem(blockItem);
        this.scene.addItem(imageItem);
        this.blockItems[name] = blockItem;
        this.imageItems[name] = imageItem;
    }

    renderScene() {
        super.renderScene();
        const {header, body} = this.props.segment;
        const [headerWidth] = rectSize(header);
        this.renderBlock(header, [0, 0], 'header');
        this.renderBlock(body, [headerWidth, 0], 'body');

        this.setSelected(this.selectedBlockName);
    }

    getImageSize() {
        const {header, body} = this.props.segment;
        const [headerWidth, headerHeight] = rectSize(header);
        const [bodyWidth] = rectSize(body);
        return [headerWidth + bodyWidth, headerHeight];
    }

    setSegment() {
        const headerItem = this.blockItems['header'];
        const bodyItem = this.blockItems['body'];
        const headerRect = headerItem.getRect();
        const bodyRect = bodyItem.getRect();

        const {header, body} = this.props.segment;
        const [headerWidth] = rectSize(header);

        const headerDelta = header[0];
        const bodyDelta = subtract(body[0], [headerWidth, 0]);
        const segment = {
            header: rectTranslate(headerRect, headerDelta), 
            body: rectTranslate(bodyRect, bodyDelta)
        };

        this.props.dispatch(setSegment(this.props.segmentIndex, segment));
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps);
        if (prevProps.tool !== this.props.tool) {
            this.handleToolChange();
            this.scene.update();
        }
        if (prevProps.segment !== this.props.segment) {
            this.handleZoom(this.props.zoomValue);
            this.scene.clear();
            this.renderScene();
            this.scene.update();
        }
    }

    getCursor() {
        switch (this.props.tool) {
            case 'edit':
                return 'default';
            case 'move':
                return 'grab';
        }
    }

    setCursor(cursor) {
        if (cursor) {
            this.canvasRef.style.cursor = cursor;
        }
        else {
            this.canvasRef.style.cursor = this.getCursor();
        }
    }

    setSelected(name) {
        if (this.selectedBlockName !== '') {
            const blockItem = this.blockItems[this.selectedBlockName];
            blockItem.setVisible(false);
            this.selectedBlockName = '';
        }
        if (name !== '') {
            const blockItem = this.blockItems[name];
            blockItem.setVisible(true);
            this.selectedBlockName = name;
        }
        this.scene.update();
    }

    handleToolChange() {
        this.setSelected('');
    }

    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);
        this.lastMousePos = mousePos;

        switchOn(this.props.tool, {
            'edit': () => {
                const item = this.scene.itemAt(mousePos);
                if (item instanceof ControlPointItem) {
                    this.dragItem = item;
                    this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
                }
                else if (item instanceof SegmentImageItem) {
                    this.setSelected(item.name);
                    this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
                }
                else if (item === null) {
                    this.setSelected('');
                }
            },

            'move': () => {
                const item = this.scene.itemAt(mousePos);
                if (item instanceof SegmentImageItem) {
                    this.dragItem = item;
                    this.canvasRef.addEventListener('mousemove', this.handleMouseMove, false);
                    this.setCursor('grabbing');
                }
            }
        });
    }

    handleMouseUp() {
        switchOn(this.props.tool, {
            'edit': () => {
                if (this.dragItem) {
                    if (this.dragItem instanceof ControlPointItem) {
                        // ensure top/bottom of other block matches
                        const blockItem = this.dragItem.parnt;
                        const rect = blockItem.getRect();
                        const top = rectTop(rect);
                        const bottom = rectBottom(rect);

                        for (let name in this.blockItems) {
                            const item = this.blockItems[name];
                            item.setTop(top);
                            item.setBottom(bottom);
                        }

                        this.dragItem = null;
                        this.canvasRef.removeEventListener('mousemove', this.handleMouseMove);
                        this.setSegment();
                    }
                }
            },

            'move': () => {
                if (this.dragItem) {
                    if (this.dragItem instanceof SegmentImageItem) {
                        this.dragItem = null;
                        this.canvasRef.removeEventListener('mousemove', this.handleMouseMove);
                        this.setCursor('');
                        this.setSegment();
                    }
                }
            }
        });
    }

    handleMouseMove(e) {
        const mousePos = this.getMousePos(e);

        switchOn(this.props.tool, {
            'edit': () => {
                if (this.dragItem instanceof ControlPointItem) {
                    if (this.dragItem.orientation === 'vertical') {
                        this.dragItem.moveBy([mousePos[0] - this.lastMousePos[0], 0]);
                    }
                    else {
                        this.dragItem.moveBy([0, mousePos[1] - this.lastMousePos[1]]);
                    }

                    this.lastMousePos = mousePos;
                    this.scene.update(); // must update scene manually since no action dispatched for move
                }
            },

            'move': () => {
                if (this.dragItem instanceof SegmentImageItem) {
                    const delta = [0, mousePos[1] - this.lastMousePos[1]];
                    this.dragItem.scrollBy(delta);

                    // apply the move to the block in the opposite direction
                    
                    const blockItem = this.blockItems[this.dragItem.name];
                    blockItem.moveBy(scale(delta, -1));

                    this.lastMousePos = mousePos;
                    this.scene.update(); // must update scene manually since no action dispatched for move
                }
            }
        });
    }

}

SegmentViewer.propTypes = extendPropTypes(ImageViewer.propTypes, {
    segmentIndex: PropTypes.number.isRequired,
    segment: PropTypes.object.isRequired,
    tool: PropTypes.string.isRequired
});

class SegmentStep extends React.Component {
    render() {
        return (
            <Step {...pickProps(Step, this.props)} >
                <SegmentInstructions key='instructions' {...pickProps(SegmentInstructions, this.props)} />
                <Error key='error' {...pickProps(Error, this.props)} />
                <SegmentStepTools key='tools' {...pickProps(SegmentStepTools, this.props)} />
                <SegmentViewer key='viewer' {...pickProps(SegmentViewer, this.props)} />
            </Step>
        );
    }
}

SegmentStep.propTypes = extendPropTypes(Step.propTypes, {
    title: PropTypes.string.isRequired,
    segmentIndex: PropTypes.number.isRequired,
    segment: PropTypes.object.isRequired,
    tool: PropTypes.string.isRequired
});

const mapStateToProps = extendMapStateToProps(Step.mapStateToProps, function(storeState) {
    const {groups} = storeState.app.workflow.template;
    const {tool, segments, segmentsOk} = storeState.steps.segment;
    const {segmentIndex} = storeState.app.task;
    return {tool, segmentIndex, title: groups[segmentIndex], segment: segments[segmentIndex], segmentOk: segmentsOk[segmentIndex]};
});

export default connect(
    mapStateToProps
)(SegmentStep);
