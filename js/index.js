const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const quackamole = new Quackamole();
let playerXY = [200, 200];
let mouseXY = [0, 0];
let playerMovementDirection = [0, 0];
const playerInput = new Map();
const playerMovementSpeed = 5; // TODO use fps delta to make it per second
const worldEntities = new Map();

////////////////////////
// DOM EVENT HANDLERS //
////////////////////////
const handlePlayerRotation = evt => {
    mouseXY = CanvasUtils.getScaledMousePosition(ctx, evt);
};

const handleKeyboardInput = evt => {
    if (playerInput.has(evt.key)) {
        playerInput.get(evt.key).active = evt.type === 'keydown';
    }
};

/////////////////
// MAIN LOGIC //
////////////////
const update = () => {
    // get movement direction based on WASD input
    playerMovementDirection = [0, 0];
    for (let input of playerInput.values()) {
        if (input.active) { playerMovementDirection = VectorUtils.add(playerMovementDirection, input.direction) }
    }
    playerMovementDirection = VectorUtils.normalize(playerMovementDirection);
    // playerMovementDirection = VectorUtils.rotate(playerMovementDirection, playerRotation); // FIXME rotating like this in 2d feels weird

    // update player location
    playerXY[0] += playerMovementDirection[0] * playerMovementSpeed;
    playerXY[1] += playerMovementDirection[1] * playerMovementSpeed;
    playerXY = VectorUtils.max(playerXY, [0, 0]);
    playerXY = VectorUtils.min(playerXY, [canvas.width, canvas.height]);

    // register entities for drawing
    worldEntities.set('mouseXY', () => CanvasUtils.drawCircle(ctx, mouseXY, 5, 'red'));

    const playerRotation = VectorUtils.lookAtRotation(playerXY, mouseXY);
    worldEntities.set('player', () => CanvasUtils.drawRectangle(ctx, playerXY, 50, 50, playerRotation));

    const gunTipXYOffset = VectorUtils.multiplyBy(VectorUtils.lookAtDirection(playerXY, mouseXY), 30);
    worldEntities.set('playerGun', () => CanvasUtils.drawLine(ctx, playerXY, VectorUtils.add(playerXY, gunTipXYOffset), 10, 'blue'));
};

const render = () => {
    CanvasUtils.clearCtx(ctx);
    for (let callback of worldEntities.values()) {
        callback();
    }
}

const gameLoop = () => {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

//////////////////////
// INITIALIZE STUFF //
//////////////////////
const init = () => {
    canvas.width = window.innerWidth * 0.95;
    canvas.height = window.innerHeight * 0.95;

    playerInput.set('w', {id: 'w', active: false, direction: [0, -1]});
    playerInput.set('a', {id: 'a', active: false, direction: [-1, 0]});
    playerInput.set('s', {id: 's', active: false, direction: [0, 1]});
    playerInput.set('d', {id: 'd', active: false, direction: [1, 0]});

    canvas.addEventListener('mousemove', handlePlayerRotation);
    document.addEventListener('keydown', handleKeyboardInput);
    document.addEventListener('keyup', handleKeyboardInput);

    requestAnimationFrame(gameLoop);
};

init();


// TODO integrate with Quackamole and render other player characters (don't worry about interpolation yet)
// TODO refactor into classes ==> Entity (abstract base class), Player, Bullet, Wall, Gun, World, Camera etc.
// TODO optimize the registration of entities to be drawn (track entities in world, draw only entities that have render flag set to true)
// TODO Improve camera. Try centering player and moving world around him as well as moving world only if player close enough to the wall
