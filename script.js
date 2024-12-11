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
grid.loopThroughItems = function (func) {
  for (let row = 0; row < grid.verLength; row++) {
    for (let col = 0; col < grid.horLength; col++) {
      func(grid.spaces[row][col], row, col);
    }
  }
};
grid.getSurroudings = function(gridPosition, distance = 1, type) {
  let { row, col } = gridPosition
  let surroundings = []

  switch(type) {
    case "cross":
      for (let r = row - distance; r <= row + distance; r++)
        if (r !== row) // prevent select same position
          if (this.spaces[r] && this.spaces[r][col] != undefined) // prevent positions out of grid
            surroundings.push(this.spaces[r][col])
      for (let c = col - distance; c <= col + distance; c++)
        if (c !== col) // prevent select same positon
          if(this.spaces[row] && this.spaces[row][c] != undefined) // prevent positions out of grid
            surroundings.push(this.spaces[row][c])
      break;
    case "block":
    default:
      for (let r = row - distance; r <= row + distance; r++) 
        for (let c = col - distance; c <= col + distance; c++)
          if (!(r === row && c === col)) // prevent select same position
            if (this.spaces[r] && this.spaces[r][c] != undefined) // prevent positions out of grid
            surroundings.push(this.spaces[r][c])
  }

  return surroundings
}
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

class Block {
  constructor() {
    this.width = grid.spaceSize - 4;
    this.relX = 2;
    this.relY = 2;
    this.relOrigin;
    this.gridPosition = {col: null, row: null}
    this.color = ["#FF4858", "#1B7F79", "#00CCC0", "#72F2EB", "#747F7F"][Math.floor(Math.random() * 5)];
    this.state = "idle"
    this.opacity = 1
    this.eventListeners = {}
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
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }
  
  // State updating
  updateFade() {
    let grow = 2

    this.opacity -= .1
    this.width += grow
    this.relX -= grow / 2
    this.relY -= grow / 2

    if (this.opacity < 0) {
      this.opacity = 0
      this.emit("fadeEnd", {
        target: this
      })
    }
  }
  updateFall() {
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
      
      if (this.y2 > block.y) 
        hit = true
    })

    if(hit) {
      this.state = "idle";
      let col = Math.round(this.relX / grid.spaceSize);
      let row = Math.round(this.relY / grid.spaceSize);
      
      grid.put(this, row, col)
    }
  }
  // Click and point handler
  isPointInside(x, y) {
    if(this.x < x && x < this.x2 && this.y < y && y < this.y2) 
      return true 
  }
  pop() {
    // Remove from grid 
    grid.spaces[this.gridPosition.row][this.gridPosition.col] = null

    this.state = "fading"
    this.on("fadeEnd", (ev) => {
      composition.remove(ev.target)
    })

    // Activate fall animation on upper blocks
    grid.loopThroughItems((item, row, col) => {
      if(col !== this.gridPosition.col)
        return //console.log(`Não é a mesma coluna\nthis.col = ${this,this.gridPosition.col}, col = ${col}`)
      if(!(item instanceof Block)) 
        return //console.log("não é bloco", item, row, col)

      if(row < this.gridPosition.row) {
        item.state = "falling"
        grid.spaces[row][col] = null
      }
    })
  }
  click() {
    // Activate pop() on the surrounding blocks with same color
    grid.getSurroudings(this.gridPosition, 1, "cross").forEach((item) => {
      if(item instanceof Block && item.color == this.color) {
        item.pop()
      }
    })
    
    this.pop()
  }
  // Life circle
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
  }
  draw() {
    let x = this.x;
    let y = this.y;
    let width = this.width;
    let radius = 10;

    ctx.globalAlpha = this.opacity
    
    // Draw the rounded corner square
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
    
    // Add the shadow inside the bottom edge

    /* The coordinates of the shadow area are as the following:
    c0─────c5    - c0 represents the coordinate x0 and y0.
    │       │    - if a value of x is used in c0 and c1,
    c1      c4     then x is named x01.
    ╰─c2─c3─╯
    */
    let x01 = x
    let x2 = x + radius
    let x3 = x + width - radius
    let x45 = x + width
    let y05 = y + width*.8 // the top point of the shadow area
    let y14 = y + width - radius
    let y23 = y + width

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
    //ctx.strokeStyle = "red"
    //ctx.lineWidth = 2
    //ctx.stroke()
    ctx.closePath();

    ctx.globalAlpha = 1
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