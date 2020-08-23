const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasBG = document.getElementById('canvas-background');
const ctxBG = canvasBG.getContext('2d');

const peerIdentifier = Math.floor(Math.random() * 100000000000); // TODO temporary peer identifier until we can request the peerId and nickname inside SDKs
const quackamole = new Quackamole();
const player = new Player(0, 0, 50, 25, 0);

const getPlayerRelXY = (posXY) => {
    return VectorUtils.relativeVector([player.x, player.y], posXY);
};

const wall01 = new Wall(0, 0, 400, 15, 0).register(ctxBG, 'wall01');
const wall02 = new Wall(-200, -200, 15, 400, 0).register(ctxBG, 'wall02');
const wall03 = new Wall(200, -200, 15, 400, 0).register(ctxBG, 'wall03');
const wall04 = new Wall(100, -200, 15, 200, 0).register(ctxBG, 'wall04');
const wall05 = new Wall(300, -300, 100, 100, 0).register(ctxBG, 'wall05');

const update = () => {
    for (let entity of Entity.registeredAll.values()) {
        entity.update();
    }
};

const render = () => {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // ctx.clearRect(-(ctx.canvas.width), -(ctx.canvas.height), ctx.canvas.width * 2, ctx.canvas.height * 2);
    ctxBG.clearRect(-ctxBG.canvas.width, -ctxBG.canvas.height, ctxBG.canvas.width * 2, ctxBG.canvas.height * 2);
    ctxBG.setTransform(1, 0, 0, 1, 0, 0);
    ctxBG.translate(canvas.width / 2, canvas.height / 2 + 0);
    ctxBG.rotate((player.rotation * Math.PI) / 180);

    for (let entity of Entity.registeredAll.values()) {
        entity.render();
    }

    CanvasUtils.drawText(ctxBG, `playerXY ${VectorUtils.round(player.posXY)}`, 0, 50);
    CanvasUtils.drawLine(ctxBG, getPlayerRelXY([0, -10000]), getPlayerRelXY([0, 10000]), 2, 'green');
    CanvasUtils.drawLine(ctxBG, getPlayerRelXY([-10000, 0]), getPlayerRelXY([10000, 0]), 2, 'red');
};

const gameLoop = () => {
    update();
    render();
    sendCurrentState();
    requestAnimationFrame(gameLoop);
};

const init = () => {
    player.register(ctx, 'localPlayer', true);
    player.init(ctx);
    quackamole.broadcastData('PEER_CONNECT', { remotePeerIdentifier: peerIdentifier });

    requestAnimationFrame(gameLoop);
};

init();

//////////////////////////
// QUACKAMOLE SDK STUFF //
//////////////////////////
const sendCurrentState = () => {
    quackamole.broadcastData('PEER_DATA', {
        remotePeerIdentifier: peerIdentifier,
        remotePlayerXY: player.posXY,
        remotePlayerRotation: player.rotation,
        remoteMouseXY: [0, 0],
    });
};

quackamole.eventManager.on('PEER_DATA', ({ remotePeerIdentifier, remotePlayerXY, remotePlayerRotation, remoteMouseXY }) => {
        // console.log('peerdata------------------', remotePlayerXY);
        if (remotePeerIdentifier === peerIdentifier) {
            return;
        }

        // register remote player for drawing
        if (!Entity.registeredAll.has(remotePeerIdentifier)) {
            const enemy = new Enemy(remotePlayerXY[0], remotePlayerXY[1], 60, 25, remotePlayerRotation).register(
                ctxBG,
                remotePeerIdentifier
            );
        } else {
            const enemy = Entity.registeredAll.get(remotePeerIdentifier);
            enemy.x = remotePlayerXY[0];
            enemy.y = remotePlayerXY[1];
            enemy.r = remotePlayerRotation;
        }

        // worldEntitiesDraft.set(remotePeerIdentifier + 'gun', () => CanvasUtils.drawLine(ctx, remotePlayerXY, VectorUtils.add(remotePlayerXY, gunTipXYOffset), 10, 'red'));
    }
);

quackamole.eventManager.on('PEER_CONNECT', ({ remotePeerIdentifier }) => {
    console.log('----- PEER CONNECTED', remotePeerIdentifier);
});

quackamole.eventManager.on('PEER_DISCONNECT', ({ remotePeerIdentifier }) => {
    console.log('PEER_DISCONNECTED', remotePeerIdentifier);
    // worldEntitiesDraft.delete(remotePeerIdentifier + 'mouseXY');
    // worldEntitiesDraft.delete(remotePeerIdentifier + 'player');
    // worldEntitiesDraft.delete(remotePeerIdentifier + 'gun');
});
