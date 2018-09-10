import {sortBy} from '../utils';
import {round} from '../geometry';
import {applyPerspective, getPerspectiveTransform} from '../imageProcessing';

function sortCorners(points) {
    points.sort(sortBy(([x, y]) => Math.sqrt(x * x + y * y)));
    const tl = points[0];
    const br = points[3];
    let bl, tr;

    if (points[1][0] < points[2][0]) {
        bl = points[1];
        tr = points[2];
    }
    else {
        bl = points[2];
        tr = points[1];
    }

    return [tl, tr, bl, br];
}

function fromY(start, end, y) {
    // return (x, y) on line between start and end

    const [x0, y0] = start;
    const [x1, y1] = end;

    return round([(x1 - x0) * (y - y0) / (y1 - y0) + x0, y]);
}

function fromX(start, end, x) {
    // return (x, y) on line between start and end

    const [x0, y0] = start;
    const [x1, y1] = end;

    return round([x, (y1 - y0) * (x - x0) / (x1 - x0) + y0]);
}

export function computeLines() {
    return (dispatch, getState) => {
        const storeState = getState();
        const corners = storeState.steps.corner.corners;

        if (corners.length < 4) {
            throw new Error('Too few circles. Please draw 4 circles, one at each corner of the table.');
        }
        else if (corners.length > 4) {
            throw new Error('Too many circles. Please draw 4 circles, one at each corner of the table.');
        }

        const src = sortCorners(corners);
        const {app} = storeState;
        const {template} = app.workflow;

        const {width, height} = app.subject.imageData;

        const tl = src[0];
        const [x0, y0] = tl;
        const dst = template.corners.map(([x, y]) => [x + x0, y + y0]);
        let m;
        try {
            m = getPerspectiveTransform(dst, src);
        }
        catch (e) {
            throw new Error('Incorrect placement of corners.');
        }

        const lines = [];

        template.xs.forEach(x => {
            const start = applyPerspective(m, [x0 + x, 0]);
            const end = applyPerspective(m, [x0 + x, height]);
            lines.push([fromY(start, end, 0), fromY(start, end, height)]);
        });

        template.ys.forEach(y => {
            const start = applyPerspective(m, [0, y0 + y]);
            const end = applyPerspective(m, [width, y0 + y]);
            lines.push([fromX(start, end, 0), fromX(start, end, width)]);
        });

        dispatch(setLines(lines));
    }
}

export function setLines(lines) {
    return {
        type: 'SET_LINES',
        lines
    };
}
