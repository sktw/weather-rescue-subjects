import {sortBy} from '../utils';
import {round} from '../geometry';

function applyTransform(args, v) {
    const [a, b, c, d, e, f] = args;
    const [x, y] = v;
    return [a * x + c * y + e, b * x + d * y + f];
}

// based on Qt's GraphicsScene

export class Scene {
    constructor(ctx) {
        this.ctx = ctx;
        this.items = [];
        this.origin = [0, 0];
        this.scale = 1.0;
        this.rotation = 0;
    }

    _findInsertIndex(item) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].zIndex > item.zIndex) {
                return i;
            }
        }

        return this.items.length;
    }

    addItem(item) {
        item.scene = this;
        this.items.push(item);
        this.items.sort(sortBy(item => item.zIndex));
        
        item.children.forEach(child => {
            this.addItem(child);
        });
    }

    removeItem(item) {
        item.scene = null;
        item.children.forEach(child => {
            this.removeItem(child);
        });

        const index = this.items.indexOf(item);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }

    getItems(cls) {
        return this.items.filter(item => item instanceof cls);
    }

    getTransform() {
        const canvas = this.ctx.canvas;
        const w = canvas.width, h = canvas.height;

        switch (this.rotation) {
            case 0:
                return [1, 0, 0, 1, 0, 0];
            case 1:
                return [0, 1, -1, 0, w, 0];
            case 2:
                return [-1, 0, 0, -1, w, h];
            case 3:
                return [0, -1, 1, 0, 0, h];
        }
    }

    getInverseTransform() {
        const canvas = this.ctx.canvas;
        const w = canvas.width, h = canvas.height;

        switch (this.rotation) {
            case 0:
                return [1, 0, 0, 1, 0, 0];
            case 1:
                return [0, -1, 1, 0, 0, w];
            case 2:
                return [-1, 0, 0, -1, w, h];
            case 3:
                return [0, 1, -1, 0, h, 0];
        }
    }

    update() {
        const canvas = this.ctx.canvas;
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.save();

        const transform = this.getTransform();
        this.ctx.setTransform(...transform);

        this.items.forEach(function(item) {
            if (item.isVisible()) {
                item.draw(this.ctx);
            }
        }, this);

        this.ctx.restore();
    }

    itemAt(pt) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.isVisible() && item.hitTest(pt)) {
                return item;
            }
        }

        return null;
    }

    toScene(pos) {
        // maps pos into the scaled scene
        const [x, y] = pos;
        const [ox, oy] = this.origin;
        return [this.scale * (x + ox), this.scale * (y + oy)];
    }

    fromView(pos) {
        // pos is a position in the drawn scene, so includes both scaling and rotation

        const transform = this.getInverseTransform();
        const [x, y] = applyTransform(transform, pos);
        const [ox, oy] = this.origin;
        return round([x / this.scale - ox, y / this.scale - oy]);
    }

    sizeToScene(size) {
        const [w, h] = size;
        const scale = this.scale;
        return [scale * w, scale * h];
    }

    sceneSize() {
        const canvas = this.ctx.canvas
        return [canvas.width, canvas.height];
    }

    clear() {
        this.items.forEach(item => item.scene = null);
        this.items = [];
    }
}

export class Item {
    constructor(parnt) {
        this.parnt = parnt;
        this.children = [];
        this.zIndex = 0;
        this._visible = true;
    }

    draw() {
    }

    hitTest() {
        return false;
    }

    isVisible() {
        return this._visible;
    }

    setVisible(sense) {
        this._visible = sense;
        this.children.forEach(child => child.setVisible(sense));
    }
}

export class FullImageItem extends Item {
    constructor(img) {
        super(null);
        this.img = img;
    }

    draw(ctx) {
        const pos = this.scene.toScene([0, 0]);
        const size = this.scene.sizeToScene([this.img.width, this.img.height]);
        ctx.save();
        ctx.drawImage(this.img, pos[0], pos[1], size[0], size[1]);
        ctx.restore()
    }

    hitTest() {
        return true;
    }
}
