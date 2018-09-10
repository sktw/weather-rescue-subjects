import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {pickProps, px} from './componentUtils';
import SummaryInstructions from './SummaryInstructions';
import {rectSize} from '../geometry';

// https://stackoverflow.com/a/15754051

function getObjectUrl(src) {
    const byteString = atob(src.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
}

class SummaryStep extends React.Component {
    constructor(props) {
        super(props);
        // convert image src into object url to avoid multiple copies
        this.state = {objectUrl: getObjectUrl(props.imageData.src)};
    }

    componentWillUnmount() {
        URL.revokeObjectURL(this.state.objectUrl);
    }

    renderBlock(block, scale) {
        const [[x0, y0]] = block;
        const [blockWidth, blockHeight] = rectSize(block);
        const {width, height} = this.props.imageData;
        const {objectUrl} = this.state;

        return (
            <div className="segment-block" style={{width: px(blockWidth * scale), height: px(blockHeight * scale), backgroundImage: 'url(' + objectUrl + ')', backgroundPosition: px(-x0 * scale) + ' ' + px(-y0 * scale), backgroundSize: px(width * scale) + ' ' + px(height * scale)}} />
        );
    }

    renderSegmentOk(segmentOk) {
        switch (segmentOk) {
            case 'y':
                return 'Yes';
            case 'n':
                return 'No';
            default:
                return '-';
        }
    }

    renderSegment(key, title, segment, segmentOk) {
        const {header, body} = segment;
        return (
            <tr key={key}>
                <td>{title}</td>
                <td>
                    <div className="segment clearfix">
                        {this.renderBlock(header, 0.5)}
                        {this.renderBlock(body, 0.5)}
                    </div>
                </td>
                <td>
                    {this.renderSegmentOk(segmentOk)}
                </td>
            </tr>
        );
    }

    render() {
        const {groups, segments, segmentsOk} = this.props;
        return (
            <div className="wrapper">
                <SummaryInstructions {...pickProps(SummaryInstructions, this.props)} />
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Subject</th>
                            <th>Correctly segmented?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {segments.map((segment, i) => this.renderSegment(i, groups[i], segment, segmentsOk[i]))}
                    </tbody>
                </table>
            </div>
        );
    }
}

SummaryStep.propTypes = {
    dispatch: PropTypes.func.isRequired,  
    groups: PropTypes.arrayOf(PropTypes.string).isRequired,
    segments: PropTypes.arrayOf(PropTypes.object).isRequired,
    segmentsOk: PropTypes.arrayOf(PropTypes.string).isRequired,
    imageData: PropTypes.object.isRequired
};

const mapStateToProps = function(storeState) {
    const {groups} = storeState.app.workflow.template;
    const {imageData} = storeState.app.subject;
    const {segments, segmentsOk} = storeState.steps.segment;
    return {groups, imageData, segments, segmentsOk};
};

export default connect(
    mapStateToProps
)(SummaryStep);
