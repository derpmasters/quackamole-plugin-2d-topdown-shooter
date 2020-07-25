const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasBG = document.getElementById('canvas-background');
const ctxBG = canvasBG.getContext('2d');

const player = new Player(0, 0, 50, 25, 0);

const getPlayerRelXY = (posXY) => {
  return VectorUtils.relativeVector([player.x, player.y], posXY);
};

const wall01 = new Wall(0, 0, 400, 15, 0).register(ctxBG, 'wall01');
const wall02 = new Wall(-200, -200, 15, 400, 0).register(ctxBG, 'wall02');
const wall03 = new Wall(200, -200, 15, 400, 0).register(ctxBG, 'wall03');
const wall04 = new Wall(100, -200, 15, 200, 0).register(ctxBG, 'wall04');

const update = () => {
    for (let entity of Entity.registered.values()) {
        entity.update();
    }
};

const render = () => {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    // ctx.clearRect(-(ctx.canvas.width), -(ctx.canvas.height), ctx.canvas.width * 2, ctx.canvas.height * 2);
    ctxBG.clearRect(-(ctxBG.canvas.width), -(ctxBG.canvas.height), ctxBG.canvas.width * 2, ctxBG.canvas.height * 2);
    ctxBG.setTransform(1, 0, 0, 1, 0, 0);
    ctxBG.translate((canvas.width / 2), (canvas.height / 2) + 0);
    ctxBG.rotate(player.r * Math.PI / 180);

    for (let entity of Entity.registered.values()) {
        entity.render();
    }

    CanvasUtils.drawText(ctxBG, `playerXY ${VectorUtils.round(player.posXY)}`, 0, 50);
    CanvasUtils.drawLine(ctxBG, getPlayerRelXY([0, -10000]), getPlayerRelXY([0, 10000]), 2, 'green');
    CanvasUtils.drawLine(ctxBG, getPlayerRelXY([-10000, 0]), getPlayerRelXY([10000, 0]), 2, 'red');
}

const gameLoop = () => {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

const init = () => {
    player.register(ctx, 'localPlayer');
    player.init(ctx);
    requestAnimationFrame(gameLoop);
};

init();
