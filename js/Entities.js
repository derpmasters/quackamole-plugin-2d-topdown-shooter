class Entity {
    static registered = new Map();
    constructor(x = 0, y = 0, w = 0, h = 0, r = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.r = r;
        this.id = null;
        this.ctx = null;
    }

    register = (ctx, id) => {
        this.id = id;
        this.ctx = ctx;
        Entity.registered.set(id, this);
        return this;
    }

    unregister = () => {
        if (this.id) {
            this.ctx = null;
            this.id = null;
            Entity.registered.delete(this.id);
        }
    }

    render = () => {
        // console.log('to be implemented');
    }

    update = () => {
        // console.log('to be implemented');
    }
}


class Player extends Entity {
    constructor(x, y, w, h, r) {
        super(x, y, w, h, r);
        this.input = new Map();
        this.movementDirection = [0, 0];
    }

    get posXY() {
        return [this.x, this.y];
    }

    render = () => {
        // NOTE: set Y to 100 here to off-center player character + outside ctxBG.translate((canvas.width / 2), (canvas.height / 2) + 100);
        CanvasUtils.drawRectangle(this.ctx, [0, 0], 50, 25, 0);
        CanvasUtils.drawCircle(this.ctx, [0, 0], 10, 'red');
    }

    init = (ctx) => {
        this.ctx = ctx;
        this.input.set('w', {id: 'w', active: false, direction: [0, -1]});
        this.input.set('a', {id: 'a', active: false, direction: [-1, 0]});
        this.input.set('s', {id: 's', active: false, direction: [0, 1]});
        this.input.set('d', {id: 'd', active: false, direction: [1, 0]});
        this.input.set('q', {id: 'q', active: false, direction: 1});
        this.input.set('e', {id: 'e', active: false, direction: -1});

        this.ctx.canvas.addEventListener('mousemove', this._handleMouseInput);
        document.addEventListener('keydown', this._handleKeyboardInput);
        document.addEventListener('keyup', this._handleKeyboardInput);
        this.ctx.canvas.onclick = () => canvas.requestPointerLock();
        this.ctx.canvas.onclick = () => canvas.requestPointerLock();
    }

    update = () => {
        // get movement direction based on WASD input
        this.movementDirection = [0, 0];
        for (let input of this.input.values()) {
            if (input.active) {
                this.movementDirection = VectorUtils.add(this.movementDirection, input.direction)
            }
        }
        this.movementDirection = VectorUtils.normalize(this.movementDirection);
        this.movementDirection = VectorUtils.rotate(this.movementDirection, this.r); // FIXME rotating like this in 2d feels weird

        // update player location
        this.x += this.movementDirection[0] * 5;
        this.y += this.movementDirection[1] * 5;


        this.r += this.input.get('q').active ? this.input.get('q').direction * 5 : 0;
        this.r += this.input.get('e').active ? this.input.get('e').direction * 5 : 0;
        this.r = this.r % 360;
    };

    _handleMouseInput = evt => {
        this.r += Math.max(Math.min(evt.movementX / 10, 5), -5);
    };

    _handleKeyboardInput = evt => {
        if (this.input.has(evt.key)) {
            this.input.get(evt.key).active = evt.type === 'keydown';
        }
    };
}

class Wall extends Entity {
    constructor(x, y, w, h, r) {
        super(x, y, w, h, r);
    }

    render = () => {
        // CanvasUtils.drawRectangle(ctx, [this.x, this.y], this.w, this.h, this.r);
        CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y]), this.w, this.h, this.r);
    }
}

class Enemy extends Entity {
    constructor(x, y, w, h, r) {
        super(x, y, w, h, r);
    }

    render = () => {
        // CanvasUtils.drawRectangle(ctx, [this.x, this.y], this.w, this.h, this.r);
        CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y]), this.w, this.h, this.r);

        CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y]), 50, 25, 0);
        CanvasUtils.drawCircle(this.ctx, [0, 0], 10, 'red');
    }
}
