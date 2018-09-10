import {intersect, round, scale, boundingRect, rectTop, rectBottom, rectLeft, rectRight, rectTranslate} from '../geometry';
import {sortBy} from '../utils';

function computeBlocks(dispatch, getState) {
    const storeState = getState();
    const lines = storeState.steps.line.lines;
    const {rows, columns} = storeState.app.workflow.template;

    const vertical = [], horizontal = [];

    lines.forEach(line => {
        const [[x0, y0], [x1, y1]] = line;
        const w = Math.abs(x1 - x0);
        const h = Math.abs(y1 - y0);
        if (w < h) {
            vertical.push(line);
        }
        else {
            horizontal.push(line);
        }
    });

    // since lines can't be deleted, only swapped between horizontal/vertical, just check number of
    // horizontal lines is correct

    if (horizontal.length !== rows + 1) { 
        throw new Error('Incorrect number of horizontal and vertical lines - there should be ' + (rows + 1) +' horizontal and ' + (columns + 1) + ' vertical lines.');
    }

    // TODO check that sorting by x1/y1 yields same order i.e. lines don't cross in the image

    horizontal.sort(sortBy(([[,y0]]) => y0));
    vertical.sort(sortBy(([[x0]]) => x0));

    const blocks = [];

    for (let i = 0; i < horizontal.length - 1; i++) {
        const h1 = horizontal[i];
        const h2 = horizontal[i + 1];

        for (let j = 0; j < vertical.length - 1; j++) {
            const v1 = vertical[j];
            const v2 = vertical[j + 1];

            const points = [intersect(h1, v1), intersect(h1, v2), intersect(h2, v1), intersect(h2, v2)].map(round);
            blocks.push(points);
        }
    }

    return blocks;
}

export function computeSegments() {
    return (dispatch, getState) => {
        const blocks = computeBlocks(dispatch, getState);
        const storeState = getState();
        const {rows, columns} = storeState.app.workflow.template;

        const segments = [];

        for (let i = 0; i < rows; i++) {
            const headerBlock = blocks[columns * i];
            const headerTr = headerBlock[1];

            for (let j = 1; j < columns; j++) {
                let headerRect = boundingRect(headerBlock);
                const bodyBlock = blocks[columns * i + j];
                const bodyTl = bodyBlock[0];
                let bodyRect = boundingRect(bodyBlock);

                const delta = [0, headerTr[1] - bodyTl[1]]; // vertical shift to align header and body
                bodyRect = rectTranslate(bodyRect, delta);

                const top = Math.min(rectTop(headerRect), rectTop(bodyRect));
                const bottom = Math.max(rectBottom(headerRect), rectTop(bodyRect));

                headerRect = [[rectLeft(headerRect), top], [rectRight(headerRect), bottom]];

                bodyRect = [[rectLeft(bodyRect), top], [rectRight(bodyRect), bottom]];
                bodyRect = rectTranslate(bodyRect, scale(delta, -1));

                const segment = {header: headerRect, body: bodyRect};
                segments.push(segment);
            }
        }

        dispatch(setSegments(segments));
    };
}

export function setSegment(index, segment) {
    return {
        type: 'SET_SEGMENT',
        index,
        segment
    };
}

export function setSegments(segments) {
    return {
        type: 'SET_SEGMENTS',
        segments
    };
}

export function setSegmentOk(index, response) {
    return {
        type: 'SET_SEGMENT_OK',
        index,
        response
    };
}
