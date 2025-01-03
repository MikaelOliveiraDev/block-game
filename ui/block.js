class Block {
  constructor() {
    this.width = Block.grid.spaceSize - 4;
    this.x = null;
    this.y = null;
    this.gridPosition = { col: null, row: null };
    this.color = Block.colors[Math.floor(Math.random() * Block.colors.length)];
    this.state = "idle";
    this.opacity = 1;
    this.eventListeners = {};
    this.velX = 0;
    this.velY = 0;
  }

  static grid;
  static colors;

  // Methods for adding and emitting event listeners
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(data));
    }
  }
  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  updateFade() {
    let grow = 2;

    this.opacity -= 0.1;
    this.width += grow;
    this.x -= grow / 2;
    this.y -= grow / 2;

    if (this.opacity < 0) {
      this.opacity = 0;
      this.emit("fadeEnd", {
        target: this,
      });
    }
  }
  updateFall() {
    const GRAVITY = 1;
    this.velY += GRAVITY;

    const willCollide = this.checkCollisionOnMove();

    if (willCollide) {
      this.state = "idle";
      this.velY = 0;

      // Snap to the grid
      let x = this.x - Block.grid.x;
      let y = this.y - Block.grid.y;
      let col = Math.round(x / Block.grid.spaceSize);
      let row = Math.round(y / Block.grid.spaceSize);
      Block.grid.put(this, row, col);
    }
  }

  checkCollisionOnMove() {
    let nextX = this.x + this.velX;
    let nextY = this.y + this.velY;
    let grid = Block.grid;

    // Predict collision with the ground
    if (nextY + this.width > grid.y + grid.height) return true;

    // Step through small intervals for better collision accuracy
    for (let stepY = this.y; stepY < nextY; stepY++) {
      // Predict collision with blocks
      let collisionDetected = false;
      grid.loopThroughItems(
        (block) => {
          if (!block || block === this) return; // Skip null blocks and self
          if (block.gridPosition.row < this.gridPosition.row) return; // Skip blocks above

          // Check collision on vertical movement
          if (nextY + this.width > block.y) collisionDetected = true;
        },
        undefined,
        this.gridPosition.col
      );

      if (collisionDetected) return true;
    }

    return false;
  }
  isPointInside(x, y) {
    let x1 = this.x;
    let x2 = this.x + this.width;
    let y1 = this.y;
    let y2 = this.y + this.width;
    if (x1 < x && x < x2 && y1 < y && y < y2) return true;
    else return false;
  }
  pop() {
    this.emit("pop", this);

    // Remove from grid
    Block.grid.spaces[this.gridPosition.row][this.gridPosition.col] = null;

    this.state = "fading";
    this.on("fadeEnd", (ev) => {
      Block.composition.remove(ev.target);
    });

    // Activate fall animation on upper blocks
    Block.grid.loopThroughItems(
      (item) => {
        if (!(item instanceof Block)) return; //console.log("não é bloco", item, row, col)

        let { row, col } = item.gridPosition;
        if (row < this.gridPosition.row) {
          item.state = "falling";
          Block.grid.spaces[row][col] = null;
        }
      },
      undefined,
      this.gridPosition.col
    );
  }
  click() {
    let color = this.color;
    let group = Block.grid.getGroup(this, block => block.color === color)

    // Only pop if there is two or more of same color
    if(group.length >= 2)
      group.forEach((block) => block.pop());
  }

  update() {
    switch (this.state) {
      case "falling":
        this.updateFall();
        break;
      case "fading":
        this.updateFade();
        break;
      case "idle":
      default:
        break;
    }

    this.y += this.velY;
  }
  draw(ctx) {
    let x = this.x;
    let y = this.y;
    let width = this.width;
    let radius = 10;

    ctx.globalAlpha = this.opacity;

    // Draw the rounded corner square
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.roundRect(x, y, width, width, radius);
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
    let y05 = y + width * 0.8; // the top point of the shadow area
    let y14 = y + width - radius;
    let y23 = y + width;

    let shadowGradient = ctx.createLinearGradient(x, y + width, x, y05);
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.25)");
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.01)");

    ctx.fillStyle = shadowGradient;

    ctx.beginPath();
    ctx.moveTo(x01, y05);
    ctx.lineTo(x01, y14);
    ctx.quadraticCurveTo(x, y + width, x2, y23);
    ctx.lineTo(x3, y23);
    ctx.quadraticCurveTo(x + width, y + width, x45, y14);
    ctx.lineTo(x45, y05);
    ctx.fill();
    ctx.closePath();

    ctx.globalAlpha = 1;
  }
}

export default Block;
