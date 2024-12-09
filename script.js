let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// Objects
let grid = {
  x: null,
  height: null,
  width: null,
  height: null,
  spaceSize: null,
  horLength: null,
  verLength: null,
  spaces: [],
};
let composition = {
  // the items that are present in the screen/game
  layers: [],
  instances: []
};
let pool = {
  // the items that are NOT present in the screen/game
};

// Grid functions
grid.createSpaces = function () {
  // This is how spaces will look like:
  // spaces [
  //	row0 [col0, col1, col2],
  //	row1 [col0, col1, col2],
  //	row2 [col0, col1, col2]
  // ]
  for (let row = 0; row < grid.verLength; row++) {
    grid.spaces[row] = [];
    for (let col = 0; col < grid.horLength; col++) {
      grid.spaces[row][col] = null;
    }
  }
};
grid.put = function(item, row, col) {
  console.log(row, col, grid.spaces[row], item)
  if(!Array.isArray(grid.spaces[row]))
    console.error(`grid row ${row} does not exists`)
  if (grid.spaces[row][col] === undefined)
    console.error(`grid column ${col} does not exists`, grid.spaces[row])

  
  item.relX = col * grid.spaceSize
  item.relY = row * grid.spaceSize
  item.relOrigin = grid;
  item.gridPosition.col = col
  item.gridPosition.row = row
  
  let removed = grid.spaces[row][col]
  grid.spaces[row][col] = item
  return removed
}
grid.loopThroughItems = function (func, ) {
  for (let row = 0; row < grid.verLength; row++) {
    for (let col = 0; col < grid.horLength; col++) {
      func(grid.spaces[row][col], row, col);
    }
  }
};
grid.draw = function () {
  ctx.fillStyle = "rgb(220, 229, 232)";
  ctx.fillRect(this.x, this.y, this.width, this.height);
};
// Composition functions
composition.include = function (item, layer) {
  let instance = item.constructor.name;

  let layers = this.layers
  let instances = this.instances

  if (!layers[layer]) layers[layer] = [];
  if (!instances[instance]) instances[instance] = [];

  layers[layer].push(item);
  instances[instance].push(item);
  item._layer = layer;
};
composition.remove = function (item) {
  let instance = item.constructor.name;

  let instances = this.instances
  let layers = this.layers

  let instanceIndex = instances[instance].indexOf(item);
  let layerIndex = layers[item._layer].indexOf(item);

  instances[instance].splice(instanceIndex, 1);
  layers[item._layer].splice(layerIndex, 1);

  return item
};
composition.loopThroughItems = function(func) {
  // The parameter func:
  //    - must be a function that is executated for every item in the composition.
  //    - the item is passed to its first argument, and the layer the second.
  //    - the return value should be a boolean that determines whether the loop should continue;

  let layers = composition.layers
  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i]
    if (!layer) continue;

    for (let ii = 0; ii < layer.length; ii++) {
      let item = layer[ii]
      if (item) {
        let continueLoop = func(item, layer)

        if(continueLoop === false) return
      }
    }
  }

}

function clr() {
  console.clear()
}

class Block {
  constructor() {
    this.width = grid.spaceSize - 4;
    this.relX = 2;
    this.relY = 2;
    this.relOrigin;
    this.gridPosition = {col: null, row: null}
    this.color = "#f58d8d";
    this.animation = {};
    this.color = ["#FF4858", "#1B7F79", "#00CCC0", "#72F2EB", "#747F7F"][
      Math.floor(Math.random() * 5)
    ];
  }

  get x() {
    let oriX = this.relOrigin?.x || 0;
    let relX = this.relX;
    return oriX + relX;
  }
  set x(x) {
    let oriX = this.relOrigin.x || 0;
    this.relX = x - oriX;
  }
  get y() {
    let oriY = this.relOrigin?.y || 0;
    let relY = this.relY;
    return oriY + relY;
  }
  set y(y) {
    let oriY = this.relOrigin?.y || 0;
    this.relY = y - oriY;
  }
  get x2() {
    return this.x + this.width
  }
  get y2() {
    return this.y + this.width
  }

  animateFall() {
    this.y += 6;
    
    let hit = false

    
    // Check if hit the ground
    if (this.y2 > grid.y + grid.height)
      hit = true
    
    
    // Check if hit bottom of a block
    grid.loopThroughItems((block, row, col) => {
      if (col != this.gridPosition.col) return // only for the same column
      if (!block) return 
      if (block == this) return // don't compare with same
      if (block.gridPosition.row < this.gridPosition.row) return
      
      block.color = "black"
      console.log(this.y2, block.y, this.y2 > block.y)
      if (this.y2 > block.y) 
        hit = true
    })

    if(hit) {
      this.animation.fall = false;
      let col = Math.round(this.relX / grid.spaceSize);
      let row = Math.round(this.relY / grid.spaceSize);
      
      grid.put(this, row, col)
    }
  }
  isPointInside(x, y) {
    if(this.x < x && x < this.x2 && this.y < y && y < this.y2) 
      return true 
  }
  click() {
    // Remove from grid and composition
    grid.spaces[this.gridPosition.row][this.gridPosition.col] = null
    composition.remove(this)
    
    let col = this.gridPosition.col 
    let row = this.gridPosition.row 
    let upper = grid.spaces[row - 1][col]
    if(upper instanceof Block)
    upper.animation.fall = true
  }
  update() {
    if (this.animation.fall) this.animateFall();
  }
  draw() {
    let x = this.x;
    let y = this.y;
    let width = this.width;
    let radius = 10;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + width - radius);
    ctx.quadraticCurveTo(x + width, y + width, x + width - radius, y + width);
    ctx.lineTo(x + radius, y + width);
    ctx.quadraticCurveTo(x, y + width, x, y + width - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}




function update() {
  requestAnimationFrame(update);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Update and draw items of the composition
  let layers = composition.layers;
  for (let i = 0; i < layers.length; i++) {
    if (!layers[i]) continue;

    for (let ii = 0; ii < layers[i].length; ii++) {
      if (layers[i][ii]) {
        if (layers[i][ii].update) layers[i][ii].update();
        if (layers[i][ii].draw) layers[i][ii].draw();
      }
    }
  }
}
function includeBlock() {
  //let row = Math.floor(Math.random() * grid.verLength)
  let col = Math.floor(Math.random() * grid.horLength);

  let block = new Block();
  block.relOrigin = grid;
  block.relX = col * grid.spaceSize;
  block.relY = -grid.spaceSize;
  block.animation.fall = true;

  composition.include(block, 3);
}

// Events
function mousedown(ev) {
  ev.preventDefault()

  let box = canvas.getBoundingClientRect()
  let x = ev.clientX - box.x
  let y = ev.clientY - box.y

  // Check if mouse went down to an item in composition
  composition.loopThroughItems((item) => {
    if(item.isPointInside && item.isPointInside(x, y)) 
      if(item instanceof Block) item.click()
  })
}
canvas.addEventListener("mousedown", mousedown)

// Initialization
canvas.width = 400;
canvas.height = 500;

grid.width = 400;
grid.height = 450;
grid.spaceSize = 50;

grid.x = (canvas.width - grid.width) / 2;
grid.y = (canvas.height - grid.height) / 2;
grid.horLength = Math.floor(grid.width / grid.spaceSize);
grid.verLength = Math.floor(grid.height / grid.spaceSize);

grid.createSpaces();

composition.include(grid, 1);

for (let row = grid.verLength - 1; row > grid.verLength - 10; row--) {
  for (let col = 0; col < grid.horLength; col++) {
    let block = new Block();
    
    grid.put(block, row,col)
    composition.include(block, 4);
  }
}

update();