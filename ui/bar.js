class Bar {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.currentValue;
    this.maxValue;
    this.color = "gold";
  }

  draw(ctx) {
    const radius = 10;

    // Draw the empty bar
    ctx.fillStyle = "hsl(195, 20.70%, 88.60%)";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.roundRect(this.x, this.y, this.width, this.height, radius);
    ctx.fill();
    ctx.closePath();

    // Draw the filled bar
    const percent = this.currentValue / this.maxValue;
    const width = this.width * percent;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.roundRect(this.x, this.y, width, this.height, radius);
    ctx.fill();
    ctx.closePath();
  }
}

export default Bar;
