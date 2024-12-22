const grid = {
  x: null,
  height: null,
  width: null,
  spaceSize: null,
  horLength: null,
  verLength: null,
  spaces: [],
};

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
grid.put = function (item, row, col) {
  if (!Array.isArray(grid.spaces[row]))
    console.error(`grid row ${row} does not exists`);
  if (grid.spaces[row][col] === undefined)
    console.error(`grid column ${col} does not exists`, grid.spaces[row]);
  if (grid.spaces[row][col] !== null)
    console.error(`The grid position [${row}][${col}] is already occupied`);

  item.relX = col * grid.spaceSize;
  item.relY = row * grid.spaceSize;
  item.relOrigin = grid;
  item.gridPosition.col = col;
  item.gridPosition.row = row;

  grid.spaces[row][col] = item;
};
grid.loopThroughItems = function (func, row, col) {
  if (typeof row === "number") {
    for (let c = 0; c < grid.horLength; c++) func(grid.spaces[row][c]);
  } else if (typeof col === "number") {
    for (let r = 0; r < grid.verLength; r++) func(grid.spaces[r][col]);
  } else {
    for (let r = 0; r < grid.verLength; r++) {
      for (let c = 0; c < grid.horLength; c++) {
        func(grid.spaces[r][c]);
      }
    }
  }
};
grid.getSurroudings = function (gridPosition, distance = 1, type) {
  let { row, col } = gridPosition;
  let surroundings = [];

  switch (type) {
    case "cross":
      for (let r = row - distance; r <= row + distance; r++)
        if (r !== row)
          if (this.spaces[r] && this.spaces[r][col] != undefined)
            // prevent select same position
            // prevent positions out of grid
            surroundings.push(this.spaces[r][col]);
      for (let c = col - distance; c <= col + distance; c++)
        if (c !== col)
          if (this.spaces[row] && this.spaces[row][c] != undefined)
            // prevent select same positon
            // prevent positions out of grid
            surroundings.push(this.spaces[row][c]);
      break;
    case "block":
    default:
      for (let r = row - distance; r <= row + distance; r++)
        for (let c = col - distance; c <= col + distance; c++)
          if (!(r === row && c === col))
            if (this.spaces[r] && this.spaces[r][c] != undefined)
              // prevent select same position
              // prevent positions out of grid
              surroundings.push(this.spaces[r][c]);
  }

  return surroundings;
};
grid.getGroup = function (startItem, groupCondition) {
  let group = [];

  function searchConnectedItems(item) {
    // Already verified?
    if (group.includes(item)) return;

    // Add to group if matches condition
    if (groupCondition(item)) {
      group.push(item);

      // Do the same with surroundings
      grid
        .getSurroudings(item.gridPosition, 1, "cross")
        .forEach((surroundItem) => {
          searchConnectedItems(surroundItem);
        });
    }
  }

  searchConnectedItems(startItem);
  return group;
};
grid.draw = function () {
  ctx.fillStyle = "rgb(220, 229, 232)";
  ctx.fillRect(this.x, this.y, this.width, this.height);
};

export default grid;