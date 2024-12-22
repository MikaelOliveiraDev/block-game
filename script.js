let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// Constants
const COLORS = ["#ef476f", "#ffc94d", "#06d6a0", "#118ab2", "#0b5a75"];

// Objects

let pool = {
  // the items that are NOT present in the screen/game
};

// Grid functions


// UI objects

class Button {
  constructor(x, y, width, height) {
    this.x = x ?? null;
    this.y = y ?? null;
    this.width = width ?? null;
    this.height = height ?? null;
    this.color = "#ffd24d";
    this.image = null;
  }

  draw() {
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

// Game logic
function includeBlock() {
  //let row = Math.floor(Math.random() * grid.verLength)
  let col = Math.floor(Math.random() * grid.horLength);

  let block = new Block();
  block.relOrigin = grid;
  block.relX = col * grid.spaceSize;
  block.relY = -grid.spaceSize;
  block.animation.fall = true;

  composition.include(block, 3);
}function insertBlock() {
  let col, attempts = 0;
  const maxAttempts = 100; // Limit the number of atempts to avoid infinite loops

  do {
    col = Math.floor(Math.random() * grid.horLength);
    let x = col * grid.spaceSize + grid.x;
    let y = grid.y;

    let overlap = false; 

    for (let block of composition.instances["Block"]) {
      if (
        block.x - block.width < x &&
        x < block.x + block.width * 2 &&
        block.y - block.width < y &&
        y < block.y + block.width * 2
      ) {
        overlap = true;
        break;
      }
    }

    if (!overlap) break;

    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    console.warn("Failed to find a valid column for the block.");
    return;
  }

  // Insert the block in the valid position
  let block = new Block();
  block.gridPosition.col = col;
  block.gridPosition.row = 0;
  block.relOrigin = grid;
  block.relX = grid.spaceSize * col;
  block.relY = 0;
  block.state = "falling";
  composition.include(block, 5);
}

// Events
function mousedown(ev) {
  ev.preventDefault();

  let box = canvas.getBoundingClientRect();
  let x = ev.clientX - box.x;
  let y = ev.clientY - box.y;

  // Check if mouse went down to an item in composition
  composition.loopThroughItems((item) => {
    if (item.isPointInside && item.isPointInside(x, y))
      if (item instanceof Block) item.click();
  });
}
canvas.addEventListener("mousedown", mousedown);

// Initialization
function update() {
  requestAnimationFrame(update);
  //setTimeout(update, 500)

  ctx.fillStyle = "lightgreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw items of the composition
  let layers = composition.layers;
  for (let i = 0; i < layers.length; i++) {
    if (!layers[i]) continue;

    for (let ii = 0; ii < layers[i].length; ii++) {
      if (layers[i][ii]) {
        if (layers[i][ii]?.update) layers[i][ii].update();
        if (layers[i][ii]?.draw) layers[i][ii].draw();
      }
    }
  }
}
canvas.width = 500;
canvas.height = 700;

let backButton = new Button(5, 5, 50, 50);
let retryButton = new Button(null, 5, 50, 50);
backButton.image = document.querySelector("img.back-arrow");
retryButton.x = canvas.width - retryButton.width - 5;
retryButton.image = document.querySelector("img.circular-arrow");
composition.include(backButton, 7);
composition.include(retryButton, 7);

grid.width = 400;
grid.height = 600;
grid.spaceSize = 50;

grid.x = (canvas.width - grid.width) / 2;
grid.y = (canvas.height - grid.height) / 2;
grid.horLength = Math.floor(grid.width / grid.spaceSize);
grid.verLength = Math.floor(grid.height / grid.spaceSize);

grid.createSpaces();

composition.include(grid, 1);

for (let row = grid.verLength - 1; row > grid.verLength - 4; row--) {
  for (let col = 0; col < grid.horLength; col++) {
    let block = new Block();

    grid.put(block, row, col);
    composition.include(block, 4);
  }
}
update();
