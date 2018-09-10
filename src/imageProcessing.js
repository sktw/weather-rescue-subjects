import {createZeroMatrix, createZeroVector, LUPSolve} from './geometry';

export function applyPerspective(m, u) {
    const x = u[0];
    const y = u[1];
    const m0 = m[0];
    const m1 = m[1];
    const m2 = m[2];
    const v1 = m0[0] * x + m0[1] * y + m0[2];
    const v2 = m1[0] * x + m1[1] * y + m1[2];
    const v3 = m2[0] * x + m2[1] * y + m2[2];

    return [v1 / v3, v2 / v3];
}

// https://github.com/opencv/opencv/blob/4560909a5e5cb284cdfd5619cdf4cf3622410388/modules/imgproc/src/imgwarp.cpp

export function getPerspectiveTransform(src, dst) {
    const a = createZeroMatrix(8);
    const b = createZeroVector(8);

    for (let i = 0; i < 4; i++) {
        const sx = src[i][0];
        const sy = src[i][1];
        const dx = dst[i][0];
        const dy = dst[i][1];

        a[i][0] = a[i + 4][3] = sx;
        a[i][1] = a[i + 4][4] = sy;
        a[i][2] = a[i + 4][5] = 1;
        a[i][3] = a[i][4] = a[i][5] = a[i + 4][0] = a[i + 4][1] = a[i + 4][2] = 0;
        a[i][6] = -sx * dx;
        a[i][7] = -sy * dx;
        a[i + 4][6] = -sx * dy;
        a[i + 4][7] = -sy * dy;
        b[i] = dx;
        b[i + 4] = dy;
    }

    const c = LUPSolve(a, b);

    return [[c[0], c[1], c[2]], [c[3], c[4], c[5]], [c[6], c[7], 1.0]];
}
