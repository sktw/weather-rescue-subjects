import React from 'react';
import PropTypes from 'prop-types';
import {switchOn} from '../utils';
import {Scene} from './scene';
import {px} from './componentUtils';
import {setZoomPercentage} from '../actions/step';


function getVerticalScrollParams(el) {
    return {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
    };
}

function getHorizontallScrollParams(el) {
    return {
        scrollLeft: el.scrollLeft,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth
    };
}

const MARGIN = 50;

class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
    }

    render() {
        return (
            <div className="viewer-container" ref={el => this.viewerContainerRef = el}>
                <div className="viewer" ref={el => this.viewerRef = el}>
                    <canvas ref={el => this.canvasRef = el} onMouseDown={this.handleMouseDown} style={{cursor: this.getCursor()}}/>
                </div>
            </div>
        );
    }

    renderScene() {
    }

    componentDidMount() {
        this.ctx = this.canvasRef.getContext('2d');
        this.scene = new Scene(this.ctx);
        this.scene.origin = [MARGIN, MARGIN];
        this.scene.rotation = this.props.rotation;
        this.renderScene();
        this.scene.update();

        this.handleZoom();
        window.addEventListener('mouseup', this.handleMouseUp, false);
        window.addEventListener('resize', this.handleZoom, false);
    }

    componentWillUnmount() {
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleZoom);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.zoomValue !== this.props.zoomValue || prevProps.rotation !== this.props.rotation) {
            this.scene.rotation = this.props.rotation;
            this.handleZoom();
            this.scene.update();
        }
    }

    getCursor() {
        return 'auto';
    }

    getMousePos(e) {
        const rect = this.canvasRef.getBoundingClientRect();
        return this.scene.fromView([e.clientX - rect.left, e.clientY - rect.top]);
    }

    handleMouseDown() {
    }

    handleMouseUp() {
    }

    handleMouseMove() {
    }

    scaleCanvas(scale) {
        let [width, height] = this.getFullSize();

        width = Math.floor(scale * width);
        height = Math.floor(scale * height);
        this.viewerRef.style.width = px(width); 
        this.viewerRef.style.height = px(height);
        this.canvasRef.width = width;
        this.canvasRef.height = height;
    }

    getImageSize() {
        const {imageData} = this.props;
        return [imageData.width, imageData.height];
    }

    getFullSize() {
        // return full size of canvas, allowing for rotation

        const [width, height] = this.getImageSize();

        if (this.props.rotation % 2 === 0) {
            return [width + 2 * MARGIN, height + 2 * MARGIN];
        }
        else {
            return [height + 2 * MARGIN, width + 2 * MARGIN];
        }
    }

    getImageRect() {
        // return image tl and br
        const size = this.getImageSize();
        return [[0, 0], size];
    }

    handleZoom() {
        const oldVerticalScrollParams = getVerticalScrollParams(this.viewerContainerRef);
        const oldHorizontalScrollParams = getHorizontallScrollParams(this.viewerContainerRef);

        let zoomScale = 0;
        const {zoomValue} = this.props;
        const [width, height] = this.getFullSize();

        switchOn(zoomValue, {
            'actual-size': () => {
                zoomScale = 1.0;
                this.scaleCanvas(zoomScale);
            },

            'fit-page': () => {
                const containerWidth = this.viewerContainerRef.clientWidth;
                const containerHeight = this.viewerContainerRef.clientHeight;
                zoomScale = Math.min(Infinity, containerWidth / width, containerHeight / height);
                this.scaleCanvas(zoomScale);
            },

            'fit-width': () => {
                const containerWidth = this.viewerContainerRef.clientWidth;
                zoomScale = containerWidth / width;
                this.scaleCanvas(zoomScale);
            },

            'default': () => {
                const percentage = parseInt(zoomValue);
                zoomScale = percentage / 100;
                this.scaleCanvas(zoomScale);
            }
        });

        // pass zoomValue back to toolbar so that it can handle zoom in/out
        const zoomPercentage = Math.round(zoomScale * 100);
        this.props.dispatch(setZoomPercentage(this.props.step, zoomValue, zoomPercentage));

        // the scrollTop varies between 0 and scrollRange = scrollHeight - clientHeight
        // after zooming, ensure scrollTop' / scrollRange' = scrollTop / scrollRange
        // for example, if the viewer was scrolled by 50% before zooming, it is scrolled by 50% after zooming

        const verticalScrollParams = getVerticalScrollParams(this.viewerContainerRef);
        const horizontalScrollParams = getHorizontallScrollParams(this.viewerContainerRef);

        const scrollTop = oldVerticalScrollParams.scrollTop * (verticalScrollParams.scrollHeight - verticalScrollParams.clientHeight) / (oldVerticalScrollParams.scrollHeight - oldVerticalScrollParams.clientHeight);
        this.viewerContainerRef.scrollTop = scrollTop;

        const scrollLeft = oldHorizontalScrollParams.scrollLeft * (horizontalScrollParams.scrollWidth - horizontalScrollParams.clientWidth) / (oldHorizontalScrollParams.scrollWidth - oldHorizontalScrollParams.clientWidth);
        this.viewerContainerRef.scrollLeft = scrollLeft;

        this.scene.scale = zoomScale;
        this.scene.update();
    }
}

ImageViewer.propTypes = {
    step: PropTypes.string.isRequired,
    imageData: PropTypes.object.isRequired,
    img: PropTypes.instanceOf(Element).isRequired,
    zoomValue: PropTypes.string.isRequired,
    rotation: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired
};

export default ImageViewer;
