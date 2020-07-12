class CanvasUtils {
    static drawLine(ctx, from, to, lineWidth, color) {
        // TODO draw it in a single path as long as mouse pressed. Could make line look better + might allow opacity color
        ctx.beginPath();
        ctx.moveTo(from[0], from[1]);
        ctx.lineTo(to[0], to[1]);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        // ctx.lineJoin = "round";
        ctx.stroke();
        ctx.closePath();
    }

    static drawRectangle = (ctx, position, width, height, rotation) => {
        ctx.fillStyle = 'grey';
        ctx.translate(position[0], position[1]);
        ctx.rotate(rotation);
        ctx.fillRect(0 - width/2, 0 - height/2, width, height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    static clearCtx = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    static drawCircle(ctx, position, radius, color) {
        ctx.beginPath();
        ctx.arc(position[0], position[1], radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    static drawText(ctx, text, x, y, alignment = 'center', fontSize = 12) {
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = alignment;
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
    }

    static drawBall = (ctx, x, y, radius, color) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }

    /**
    * use this to convert base64 encoded data to raw binary data held in a string
    * @param dataURI dataURI base64 encoded data
    */
    static base64ToBlob  = (dataURI) => {
        // origin: https://gist.github.com/fupslot/5015897#gistcomment-2123297
        dataURI = dataURI.replace(/^data:/, '');

        const type = dataURI.match(/image\/[^;]+/);
        const base64 = dataURI.replace(/^[^,]+,/, '');
        const arrayBuffer = new ArrayBuffer(base64.length);
        const typedArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < base64.length; i++) {
            typedArray[i] = base64.charCodeAt(i);
        }

        return new Blob([arrayBuffer], {type});
    };

    static getScaledMousePosition = (ctx, evt) => {
        // https://stackoverflow.com/a/43873988
        const bounds = ctx.canvas.getBoundingClientRect();

        // get the mouse coordinates, subtract the canvas top left and any scrolling
        const pageX = evt.type.includes('touch') ? evt.touches[0].pageX : evt.pageX;
        const pageY = evt.type.includes('touch') ? evt.touches[0].pageY : evt.pageY;
        let x = pageX - bounds.left - scrollX;
        let y = pageY - bounds.top - scrollY;

        // first normalize the mouse coordinates from 0 to 1 (0,0) top left
        // off canvas and (1,1) bottom right by dividing by the bounds width and height
        // then scale to canvas coordinates by multiplying the normalized coords with the canvas resolution
        x = (x / bounds.width) * ctx.canvas.width;
        y = (y / bounds.height) * ctx.canvas.height;

        return [Math.round(x), Math.round(y)];
    };
}
