class Entity {
    static registeredAll = new Map();
    static registeredMoving = new Map();
    static registeredStatic = new Map();

    constructor(x = null, y = null, w = null, h = null, rotation = null, radius = null) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rotation = rotation;
        this.radius = radius;
        this.id = null;
        this.ctx = null;
    }

    get left() { return this.x - this.w / 2; }
    get right() { return this.x + this.w /2; }
    get top() { return this.y - this.h / 2; }
    get bottom() { return this.y + this.h / 2; }
    get XY() { return [this.x, this.y]; }

    register = (ctx, id, moving = false) => {
        this.id = id;
        this.ctx = ctx;
        Entity.registeredAll.set(id, this);
        moving ? Entity.registeredMoving.set(id, this) : Entity.registeredStatic.set(id, this);
        return this;
    }

    unregister = () => {
        if (this.id) {
            this.ctx = null;
            this.id = null;
            Entity.registeredAll.delete(this.id);
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
    constructor(x, y, rotation, radius) {
        super(x, y, radius, radius, rotation, radius);
        this.input = new Map();
        this.movementDirection = [0, 0];
    }

    get posXY() {
        return [this.x, this.y];
    }

    render = () => {
        // NOTE: set Y to 100 here to off-center player character + outside ctxBG.translate((canvas.width / 2), (canvas.height / 2) + 100);
        CanvasUtils.drawRectangle(this.ctx, [0, 0], 50, 25, 0);
        CanvasUtils.drawRectangle(this.ctx, [-10, -17,5], 10, 10, 0);
        CanvasUtils.drawRectangle(this.ctx, [10, -17,5], 10, 10, 0);

        CanvasUtils.drawCircle(this.ctx, [0, -2,5], 10, 'blue');
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
        this.movementDirection = VectorUtils.rotate(this.movementDirection, this.rotation); // FIXME rotating like this in 2d feels weird

        // update player location
        this.x += this.movementDirection[0] * 5;
        this.y += this.movementDirection[1] * 5;

        for (let [id, staticEntity] of Entity.registeredStatic.entries()) {
            if (id) {
                const collisionDetected = CollisionUtils.circleRect(this, staticEntity);

                if (collisionDetected) {
                    const rel = VectorUtils.relativeVector(staticEntity.XY, this.XY);

                    // check which axis requires least correction
                    let correctionX = null;
                    let correctionY = null;

                    let distanceX = null;
                    let distanceY = null;

                    // Correction X axis, to left or right
                    if (rel[0] < 0) {
                        distanceX = VectorUtils.relativeVector(this.XY, [staticEntity.left, this.y])[0];
                        correctionX = staticEntity.left - this.radius;
                    } else {
                        distanceX = VectorUtils.relativeVector(this.XY, [staticEntity.right, this.y])[0];
                        correctionX = staticEntity.right + this.radius;
                    }

                    // // Correction Y axis, to top or bottom
                    if (rel[1] < 0) {
                        distanceY = VectorUtils.relativeVector(this.XY, [this.x, staticEntity.top])[1];
                        correctionY = staticEntity.top - this.radius;
                    } else {
                        distanceY = VectorUtils.relativeVector(this.XY, [this.x, staticEntity.bottom])[1];
                        correctionY = staticEntity.bottom + this.radius;
                    }

                    // Check if player within Y axis bounds of colliding object
                    if (this.bottom > staticEntity.top && this.top < staticEntity.bottom) {
                        this.x = correctionX;
                    }

                    // Check if player within X axis bounds of colliding object
                    if (this.right > staticEntity.left && this.left < staticEntity.right) {
                        this.y = correctionY;
                    }
                }
            }
        }

        this.rotation += this.input.get('q').active ? this.input.get('q').direction * 5 : 0;
        this.rotation += this.input.get('e').active ? this.input.get('e').direction * 5 : 0;
        this.rotation = this.rotation % 360;
    };

    _handleMouseInput = evt => {
        this.rotation += Math.max(Math.min(evt.movementX / 10, 5), -5);
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
        CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y]), this.w, this.h, this.rotation);
    }
}

class Enemy extends Entity {
    constructor(x, y, w, h, r) {
        super(x, y, w, h, r);
    }

    render = () => {
        // CanvasUtils.drawRectangle(ctx, [this.x, this.y], this.w, this.h, this.r);
        // CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y]), this.w, this.h, this.r);

        CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y]), 50, 25, -this.rotation);
        CanvasUtils.drawRectangle(this.ctx, getPlayerRelXY([this.x, this.y + 15]), 25, 30, -this.rotation);
        CanvasUtils.drawCircle(this.ctx, getPlayerRelXY([this.x, this.y]), 10, 'red');
    }
}
