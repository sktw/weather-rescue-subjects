export function intersect(line1, line2) {
    const [[x0, y0], [x1, y1]] = line1;
    const [[x2, y2], [x3, y3]] = line2;

    const m = [[x1 - x0, x2 - x3], [y1 - y0, y2 - y3]];
    const b = [x2 - x0, y2 - y0];
    try {
        const [p] = LUPSolve(m, b);
        return [x0 + p * (x1 - x0), y0 + p * (y1 - y0)];
    }
    catch (e) {
        console.error(e);
        return null;
    }
}

export function round(v) {
    const [x, y] = v;
    return [Math.round(x), Math.round(y)];
}

export function add(u, v) {
    const [x0, y0] = u;
    const [x1, y1] = v;
    return [x0 + x1, y0 + y1];
}

export function subtract(u, v) {
    const [x0, y0] = u;
    const [x1, y1] = v;
    return [x0 - x1, y0 - y1];
}

export function scale(v, s) {
    const [x, y] = v;
    return [s * x, s * y];
}

export function boundingRect(points) {
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;

    points.forEach(([x, y]) => {
        xmin = Math.min(xmin, x);
        xmax = Math.max(xmax, x);
        ymin = Math.min(ymin, y);
        ymax = Math.max(ymax, y);
    });

    return [[xmin, ymin], [xmax, ymax]];
}

export function rectSize(rect) {
    const [tl, br] = rect;
    const [x0, y0] = tl;
    const [x1, y1] = br;
    return [Math.abs(x1 - x0), Math.abs(y1 - y0)];
}

export function rectTop(rect) {
    return rect[0][1];
}

export function rectBottom(rect) {
    return rect[1][1];
}

export function rectLeft(rect) {
    return rect[0][0];
}

export function rectRight(rect) {
    return rect[1][0];
}

export function rectMidpoints(rect) {
    const [tl, br] = rect;
    const [x0, y0] = tl;
    const [x1, y1] = br;

    return [[(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1], [x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]];
}

export function rectContainsPoint(rect, point) {
    const [[x0, y0], [x1, y1]] = rect;
    const [x, y] = point;

    return x0 < x && x < x1 && y0 < y && y < y1;
}

export function rectTranslate(rect, v) {
    const [tl, br] = rect;
    return [add(tl, v), add(br, v)];
}

export function createZeroMatrix(n) {
    const m = [];
    const row = createZeroVector(n);

    for (let i = 0; i < n; i++) {
        m.push(row.slice(0));
    }

    return m;
}

export function createZeroVector(n) {
    const v = [];
    for (let i = 0; i < n; i++) {
        v.push(0);
    }

    return v;
}

export function copyMatrix(a) {
    const b = [];
    for (let i = 0; i < a.length; i++) {
        b.push(a[i].slice(0));
    }

    return b;
}

// https://en.wikipedia.org/wiki/LU_decomposition#C_code_examples

function LUPDecompose(a, tol, p) {
    const n = a.length;

    for (let i = 0; i <= n; i++) {
        p[i] = i;
    }

    for (let i = 0; i < n; i++) {
        let maxa = 0;
        let imax = i;

        for (let k = i; k < n; k++) {
            const absa = Math.abs(a[k][i]);
            if (absa > maxa) {
                maxa = absa;
                imax = k;
            }
        }

        if (maxa < tol) {
            throw new Error('Matrix is degenerate');
        }

        if (imax != i) {
            const j = p[i];
            p[i] = p[imax];
            p[imax] = j;

            const row = a[i];
            a[i] = a[imax];
            a[imax] = row;

            p[n]++;
        }

        for (let j = i + 1; j < n; j++) {
            a[j][i] /= a[i][i];

            for (let k = i + 1; k < n; k++) {
                a[j][k] -= a[j][i] * a[i][k];
            }
        }
    }
}

export function LUPSolve(m, b) {
    const n = m.length;
    const p = createZeroVector(n + 1);
    const x = createZeroVector(n);
    const a = copyMatrix(m);
    LUPDecompose(a, 1e-9, p);

    for (let i = 0; i < n; i++) {
        x[i] = b[p[i]];

        for (let k = 0; k < i; k++) {
            x[i] -= a[i][k] * x[k];
        }
    }

    for (let i = n - 1; i >= 0; i--) {
        for (let k = i + 1; k < n; k++) {
            x[i] -= a[i][k] * x[k];
        }

        x[i] = x[i] / a[i][i];
    }

    return x;
}
