const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const quackamole = new Quackamole();
let playerXY = [200, 200];
let playerRotation = 0;
let mouseXY = [0, 0];
let playerMovementDirection = [0, 0];
const playerInput = new Map();
const playerMovementSpeed = 5; // TODO use fps delta to make it more deterministic
const worldEntities = new Map();
const peerIdentifier = Math.floor(Math.random() * 100000000000); // TODO temporary peer identifier until we can request the peerId and nickname inside SDKs

//////////////////////////
// QUACKAMOLE SDK STUFF //
//////////////////////////
const sendCurrentState = () => {
    quackamole.broadcastData('PEER_DATA', {
        remotePeerIdentifier: peerIdentifier,
        remotePlayerXY: playerXY,
        remotePlayerRotation: playerRotation,
        remoteMouseXY: mouseXY
    });
};

quackamole.eventManager.on('PEER_DATA', ({remotePeerIdentifier, remotePlayerXY, remotePlayerRotation, remoteMouseXY}) => {
    if (remotePeerIdentifier === peerIdentifier) { return; }

    // register remote player for drawing
    worldEntities.set(remotePeerIdentifier + 'mouseXY', () => CanvasUtils.drawCircle(ctx, remoteMouseXY, 5, 'red'));
    worldEntities.set(remotePeerIdentifier + 'player', () => CanvasUtils.drawRectangle(ctx, remotePlayerXY, 50, 50, remotePlayerRotation));

    const gunTipXYOffset = VectorUtils.multiplyBy(VectorUtils.lookAtDirection(remotePlayerXY, remoteMouseXY), 30);
    worldEntities.set(remotePeerIdentifier + 'gun', () => CanvasUtils.drawLine(ctx, remotePlayerXY, VectorUtils.add(remotePlayerXY, gunTipXYOffset), 10, 'red'));
});

quackamole.eventManager.on('PEER_CONNECT', ({remotePeerIdentifier}) => {
    console.log('----- PEER CONNECTED', remotePeerIdentifier);
});

quackamole.eventManager.on('PEER_DISCONNECT', ({remotePeerIdentifier}) => {
    console.log('PEER_DISCONNECTED', remotePeerIdentifier);
    worldEntities.delete(remotePeerIdentifier + 'mouseXY');
    worldEntities.delete(remotePeerIdentifier + 'player');
    worldEntities.delete(remotePeerIdentifier + 'gun');
});


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

window.onbeforeunload = () => {
    console.log('-----onbeforeunload');
    quackamole.broadcastData('PEER_DISCONNECT', {peerIdentifier});
    alert("onbeforeunload was triggered");
    prompt('Do you really want to leave?');
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
    worldEntities.set(peerIdentifier + 'mouseXY', () => CanvasUtils.drawCircle(ctx, mouseXY, 5, 'blue'));

    playerRotation = VectorUtils.lookAtRotation(playerXY, mouseXY);
    worldEntities.set(peerIdentifier + 'player', () => CanvasUtils.drawRectangle(ctx, playerXY, 50, 50, playerRotation));

    const gunTipXYOffset = VectorUtils.multiplyBy(VectorUtils.lookAtDirection(playerXY, mouseXY), 30);
    worldEntities.set(peerIdentifier + 'gun', () => CanvasUtils.drawLine(ctx, playerXY, VectorUtils.add(playerXY, gunTipXYOffset), 10, 'blue'));
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
    sendCurrentState();
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

    quackamole.broadcastData('PEER_CONNECT', {remotePeerIdentifier: peerIdentifier});

    requestAnimationFrame(gameLoop);
};

init();

// TODO integrate with Quackamole and render other player characters (don't worry about interpolation yet)
// TODO refactor into classes ==> Entity (abstract base class), Player, Bullet, Wall, Gun, World, Camera etc.
// TODO optimize the registration of entities to be drawn (track entities in world, draw only entities that have render flag set to true)
// TODO Improve camera. Try centering player and moving world around him as well as moving world only if player close enough to the wall
// TODO add a z-index for each entity and sort all entities before rendering them
