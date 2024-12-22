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
