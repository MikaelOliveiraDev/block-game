class Button {
  constructor(x, y, width, height) {
    this.x = x ?? null;
    this.y = y ?? null;
    this.width = width ?? null;
    this.height = height ?? null;
    this.color = "#ffd24d";
    this.image = null;
  }

  draw(ctx) {
    let { x, y, width, height } = this;
    let radius = 10;

    // Draw the rounded corner square
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // Add the shadow inside the bottom edge

    /* The coordinates of the shadow area are as the following:
	  c0─────c5    - c0 represents the coordinate x0 and y0.
	  │       │    - if a value of x is used in c0 and c1,
	  c1      c4     then x is named x01.
	  ╰─c2─c3─╯
	  */
    let x01 = x;
    let x2 = x + radius;
    let x3 = x + width - radius;
    let x45 = x + width;
    let y05 = y + height * 0.8; // the top point of the shadow area
    let y14 = y + height - radius;
    let y23 = y + height;

    let shadowGradient = ctx.createLinearGradient(x, y + height, x, y05);
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.25)");
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.01)");

    ctx.fillStyle = shadowGradient;

    ctx.beginPath();
    ctx.moveTo(x01, y05);
    ctx.lineTo(x01, y14);
    ctx.quadraticCurveTo(x, y + height, x2, y23);
    ctx.lineTo(x3, y23);
    ctx.quadraticCurveTo(x + width, y + height, x45, y14);
    ctx.lineTo(x45, y05);
    ctx.fill();
    //ctx.strokeStyle = "red"
    //ctx.lineWidth = 2
    //ctx.stroke()
    ctx.closePath();

    if (this.image) {
      const margin = this.width * 0.15;
      const x = this.x + margin;
      const y = this.y + margin;
      const width = this.width - margin * 2;
      const height = this.height - margin * 2;
      ctx.drawImage(this.image, x, y, width, height);
    }
  }
}

export default Button;