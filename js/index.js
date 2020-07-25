const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const canvasBackground = document.getElementById('canvas-background');
const ctxBackground = canvasBackground.getContext('2d');
let playerRotation = 0;
let playerPosition = [100, 0];

canvas.width = window.innerWidth * 0.95;
canvas.height = window.innerHeight * 0.95;

canvasBackground.width = window.innerWidth * 0.95;
canvasBackground.height = window.innerHeight * 0.95;

////////////
// PLAYER //
////////////
ctx.translate(canvas.width / 2, canvas.height / 2);
CanvasUtils.drawRectangle(ctx, [0, 0], 50, 25, 0);
CanvasUtils.drawCircle(ctx, [0, 0], 10, 'red');

///////////////
// ZA WARUDO //
///////////////
// ctxBackground.translate(canvas.width / 2, canvas.height / 2);
//
// ctxBackground.rotate(playerRotation * Math.PI / 180);
// CanvasUtils.drawRectangle(ctxBackground, [60, 0], 50, 25, 22,5);
// CanvasUtils.drawRectangle(ctxBackground, [60, 60], 50, 25, 45);
// CanvasUtils.drawRectangle(ctxBackground, [60, 120], 50, 25, 77,5);
// CanvasUtils.drawRectangle(ctxBackground, [60, 180], 50, 25, 90);
// CanvasUtils.drawRectangle(ctxBackground, [60, 240], 50, 25, 112,5);
//
// CanvasUtils.drawRectangle(ctxBackground, [120, 0], 50, 25, 0);
// CanvasUtils.drawRectangle(ctxBackground, [120, 60], 50, 25, 0);
//

document.addEventListener('keydown', evt => {
    console.log('update player rotation', playerRotation)
    if (evt.key === 'q') {
        playerRotation += 5;
    } else if (evt.key === 'e') {
        playerRotation -= 5;
    }

    if (evt.key === 'w') {
        const unrotatedPlayer
        playerPosition[1] += 5;
    } else if (evt.key === 's') {
        playerPosition[1] -= 5;
    }
})


const render = () => {
    ctxBackground.setTransform(1, 0, 0, 1, 0, 0);
    ctxBackground.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctxBackground.translate((canvas.width / 2), (canvas.height / 2));
    ctxBackground.rotate(playerRotation * Math.PI / 180);
    // ctxBackground.translate(...VectorUtils.rotate(playerPosition, playerRotation * Math.PI / 180));
    CanvasUtils.drawRectangle(ctxBackground, [60, 0], 50, 25, 22, 5);
    CanvasUtils.drawRectangle(ctxBackground, [60, 60], 50, 25, 45);
    CanvasUtils.drawRectangle(ctxBackground, [60, 120], 50, 25, 77, 5);
    CanvasUtils.drawRectangle(ctxBackground, [60, 180], 50, 25, 90);
    CanvasUtils.drawRectangle(ctxBackground, [60, 240], 50, 25, 112, 5);

    CanvasUtils.drawRectangle(ctxBackground, [120, 0], 50, 25, 0);
    CanvasUtils.drawRectangle(ctxBackground, [120, 60], 50, 25, 0);

};


const main = () => {
    // update();
    render();

    requestAnimationFrame(main);
}

requestAnimationFrame(main);
