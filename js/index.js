const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasBG = document.getElementById('canvas-background');
const ctxBG = canvasBG.getContext('2d');

let playerXY = [100, 0];
let playerRotation = 45;
let playerMovementDirection = [0, 0];
const playerInput = new Map();
let worldEntities = new Map();

const getPlayerRelXY = (posXY) => {
  return VectorUtils.relativeVector(playerXY, posXY);
};

worldEntities.set('rect1', () => CanvasUtils.drawRectangle(ctxBG, getPlayerRelXY([0, 0]), 400, 15, 0));
worldEntities.set('rect2', () => CanvasUtils.drawRectangle(ctxBG, getPlayerRelXY([-200, -200]), 15, 400, 0));
worldEntities.set('rect3', () => CanvasUtils.drawRectangle(ctxBG, getPlayerRelXY([200, -200]), 15, 400, 0));
worldEntities.set('rect3', () => CanvasUtils.drawRectangle(ctxBG, getPlayerRelXY([100, -200]), 15, 200, 0));


////////////
// PLAYER //
////////////
// ctx.translate(canvas.width / 2, canvas.height / 2);
// CanvasUtils.drawRectangle(ctx, [0, 0], 50, 25, 0);
// CanvasUtils.drawCircle(ctx, [0, 0], 10, 'red');

// const getRotatedInputDirection = () => {
//     // get movement direction based on WASD input
//     playerMovementDirection = [0, 0];
//     for (let input of playerInput.values()) {
//         if (input.active) {
//             playerMovementDirection = VectorUtils.add(playerMovementDirection, input.direction)
//         }
//     }
//     playerMovementDirection = VectorUtils.normalize(playerMovementDirection);
//     playerMovementDirection = VectorUtils.rotate(playerMovementDirection, playerRotation); // FIXME rotating like this in 2d feels weird
//     console.log('INPUT DIRECTION', playerMovementDirection);
// }

const update = () => {
    // get movement direction based on WASD input
    playerMovementDirection = [0, 0];
    for (let input of playerInput.values()) {
        if (input.active) {
            playerMovementDirection = VectorUtils.add(playerMovementDirection, input.direction)
        }
    }
    playerMovementDirection = VectorUtils.normalize(playerMovementDirection);
    playerMovementDirection = VectorUtils.rotate(playerMovementDirection, playerRotation); // FIXME rotating like this in 2d feels weird

    // update player location
    playerXY[0] += playerMovementDirection[0] * 5;
    playerXY[1] += playerMovementDirection[1] * 5;


    playerRotation += playerInput.get('q').active ? playerInput.get('q').direction * 5 : 0;
    playerRotation += playerInput.get('e').active ? playerInput.get('e').direction * 5 : 0;
    playerRotation = playerRotation % 360;
};

const render = () => {
    ctxBG.clearRect(-(ctxBG.canvas.width), -(ctxBG.canvas.height), ctxBG.canvas.width * 2, ctxBG.canvas.height * 2);

    ctxBG.setTransform(1, 0, 0, 1, 0, 0);
    ctxBG.translate((canvas.width / 2), (canvas.height / 2) + 100);
    ctxBG.rotate(playerRotation * Math.PI / 180);

    for (let callback of worldEntities.values()) { callback(); }

    CanvasUtils.drawText(ctxBG, `playerXY ${VectorUtils.round(playerXY)}`, 0, 50);

    // CanvasUtils.drawLine(ctxBG, VectorUtils.add([0,0], [0, -100]), VectorUtils.add([0,0], [0, 100]), 2, 'green');
    // CanvasUtils.drawLine(ctxBG, VectorUtils.add([0,0], [-200, 0]), VectorUtils.add([0,0], [200, 0]), 2, 'red');
    CanvasUtils.drawLine(ctxBG, getPlayerRelXY([0, -10000]), getPlayerRelXY([0, 10000]), 2, 'green');
    CanvasUtils.drawLine(ctxBG, getPlayerRelXY([-10000, 0]), getPlayerRelXY([10000, 0]), 2, 'red');

    getPlayerRelXY([0, 0])

    // worldEntities = new Map(worldEntitiesDraft);
    // worldEntitiesDraft = worldEntities;
}

const gameLoop = () => {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

//////////////////////
// INITIALIZE STUFF //
//////////////////////
const handleMouseInput = evt => {
    playerRotation += Math.min(evt.movementX / 3, 5);
};

const handleKeyboardInput = evt => {
    if (playerInput.has(evt.key)) { playerInput.get(evt.key).active = evt.type === 'keydown'; }
};

const init = () => {
    playerInput.set('w', {id: 'w', active: false, direction: [0, -1]});
    playerInput.set('a', {id: 'a', active: false, direction: [-1, 0]});
    playerInput.set('s', {id: 's', active: false, direction: [0, 1]});
    playerInput.set('d', {id: 'd', active: false, direction: [1, 0]});
    playerInput.set('q', {id: 'q', active: false, direction: 1});
    playerInput.set('e', {id: 'e', active: false, direction: -1});

    canvas.addEventListener('mousemove', handleMouseInput);
    document.addEventListener('keydown', handleKeyboardInput);
    document.addEventListener('keyup', handleKeyboardInput);
    canvas.onclick = () => canvas.requestPointerLock();
    canvasBG.onclick = () => canvas.requestPointerLock();

    // ctx.translate((canvas.width / 2), (canvas.height / 2));
    // CanvasUtils.drawCircle(ctx, [0, 0], 20, 'salmon');

    ctx.translate(canvas.width / 2, canvas.height / 2);
    CanvasUtils.drawRectangle(ctx, [0, 100], 50, 25, 0);
    CanvasUtils.drawCircle(ctx, [0, 100], 10, 'red');

    requestAnimationFrame(gameLoop);
};

init();
