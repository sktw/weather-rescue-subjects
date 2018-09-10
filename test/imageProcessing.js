import {expect} from 'chai';
import {applyPerspective, getPerspectiveTransform} from '../src/imageProcessing';
import {round} from '../src/geometry';

const src = [[30, 118], [1453, 102], [65, 1961], [1485, 1926]];
const dst = [[0, 0], [1420, 0], [0, 1840], [1420, 1840]];

function convertZero(v) {
    let [x, y] = v;
    if (x === -0) {
        x = 0;
    }
    if (y === -0) {
        y = 0;
    }

    return [x, y];
}

describe('perspective transformation', () => {
    it('check perspective transform transforms src to dst', () => {
        const m = getPerspectiveTransform(src, dst);
        expect(convertZero(round(applyPerspective(m, src[0])))).to.deep.equal(dst[0]);
        expect(convertZero(round(applyPerspective(m, src[1])))).to.deep.equal(dst[1]);
        expect(convertZero(round(applyPerspective(m, src[2])))).to.deep.equal(dst[2]);
        expect(convertZero(round(applyPerspective(m, src[3])))).to.deep.equal(dst[3]);
    });

    it('check perspective transform transforms dst to src', () => {
        const m = getPerspectiveTransform(dst, src);
        expect(convertZero(round(applyPerspective(m, dst[0])))).to.deep.equal(src[0]);
        expect(convertZero(round(applyPerspective(m, dst[1])))).to.deep.equal(src[1]);
        expect(convertZero(round(applyPerspective(m, dst[2])))).to.deep.equal(src[2]);
        expect(convertZero(round(applyPerspective(m, dst[3])))).to.deep.equal(src[3]);
    });

});
