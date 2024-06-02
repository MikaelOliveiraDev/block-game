import Block from "./block.js"
import { piecesTray } from "./pieces-tray.js"
import { pools } from "./pools.js"

class Piece {
	constructor(board) {
		this.x = null;
		this.y = null;
		this.blocks = []
		this.shadow = []
		this.shadowIndexX = null;
		this.shadowIndexY = null;
		this.isBeingDragged = false;
		this.isShadowVisible = false;
		this.zIndex = 0;
		this.targetX = null
		this.targetY = null
		this.imageIndex = Math.floor(Math.random() * 5)
		this.board = board
	}

	static patterns = [
		[
			[0, 1, 0],
			[1, 1, 1]
		],[
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		],[
			[1, 0],
			[1, 1],
			[0, 1]
		],[
			[0, 1],
			[1, 1],
			[1, 0]
		],[
			[1, 1, 1],
			[1, 0, 0]
		],[
			[1, 0, 0],
			[1, 1, 1]
		],[
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 1],
		],[
			[1, 1, 1, 1]
		],[
			[1, 1, 1, 1, 1]
		],[
			[1, 1],
			[1, 1]
		],[
			[1, 0],
			[1, 1]
		],[
			[1, 1]
		],[
			[1, 1],
			[1, 1],
			[1, 1]
		],[
			[1],
		]
	]
	static rotatePattern(pattern) {

		// Get the number of rows and columns at pattern
		const rows = pattern.length;
		const cols = pattern[0].length;

		const rotatedPattern = [];

		// Determine the dimensions of the rotated pattern based on the original pattern
		const newRows = cols
		const newCols = rows

		// Loop through each row of the rotated pattern
		for (let r = 0; r < newRows; r++) {
			rotatedPattern.push([]);

			// Loop through each column of the rotatedPattern
			for (let c = 0; c < newCols; c++) {
				// Handle cases based on the original pattern dimensions
				rotatedPattern[r].push(pattern[rows - 1 - c][r]);
			}
		}
		return rotatedPattern;
	}
	
	init(board, pattern, rotate) {
		if(!pattern) {
			// Select a random pattern
			let index = Math.floor(Math.random() * Piece.patterns.length)
			pattern = Piece.patterns[index]
		}
		if(rotate) {
			// Rotate some times
			let rotations = Math.floor(Math.random() * 4)
			for (let i = 0; i < rotations; i++)
				pattern = Piece.rotatePattern(pattern)
		}
		
		this.createGrid(pattern)
		this.width = board.blockWidth * pattern[0].length
		this.height = board.blockWidth * pattern.length
	}
	createGrid(pattern) {
		for (let y in pattern) {
			this.blocks[y] = []
			this.shadow[y] = []
			for (let x in pattern[y]) {
				//console.log(pattern.length, pattern[y].length)
				//console.log(y, x, pattern)
				if (pattern[y][x] === 1) {
					this.blocks[y][x] = pools.get(Block)
					this.blocks[y][x].imageIndex = this.imageIndex
					this.blocks[y][x].globalAlpha = 1

					this.shadow[y][x] = pools.get(Block)
					this.shadow[y][x].imageIndex = this.imageIndex
					this.shadow[y][x].globalAlpha = .5
				} else {
					this.blocks[y][x] = null;
					this.shadow[y][x] = null;
				}
			}
		}
	}
	updateBlocksPosition() {
		for (let y in this.blocks) {
			for (let x in this.blocks[y]) {
				let block = this.blocks[y][x]
				if (block === null) continue

				let blockOffsetX = x * block.width
				let blockOffsetY = y * block.width
				block.x = this.x + blockOffsetX
				block.y = this.y + blockOffsetY
			}
		}
	}
	updateShadowPosition() {
		let board = this.board
		let pieceX = this.x;
		let pieceY = this.y;
		// The position of the piece relative to the board
		let relX = pieceX - board.x;
		let relY = pieceY - board.y;

		// The distance between the corner of the piece
		// and the corner of the previous grid space
		let remainingX = relX % board.blockWidth;
		let remainingY = relY % board.blockWidth;
		// Position the shadow on the corner of the
		// previous grid space
		let shadowX = pieceX - remainingX;
		let shadowY = pieceY - remainingY;
		// Check if the piece is actually
		// closer to the next grid space
		let halfBlock = board.blockWidth / 2;
		if (remainingX > halfBlock) shadowX += board.blockWidth;
		if (remainingY > halfBlock) shadowY += board.blockWidth;

		// Prevent the shadow the be shown outside of the board
		let isToTheLeft = shadowX < board.x
		let isToTheRight = shadowX > board.x + board.width - this.width
		let isOverTheTop = shadowY < board.y
		let isUnderTheBottom = shadowY > board.y + board.height - this.height
		if (isToTheLeft || isToTheRight || isOverTheTop || isUnderTheBottom)
			return this.isShadowVisible = false;

		this.shadowIndexX = (shadowX - board.x) / board.blockWidth;
		this.shadowIndexY = (shadowY - board.y) / board.blockWidth;

		let fit = board.checkFit(this, this.shadowIndexY, this.shadowIndexX)
		if (fit) {
			for (let y in this.shadow) {
				for (let x in this.shadow[y]) {
					if (!this.shadow[y][x]) continue;
					let blockOffsetX = x * board.blockWidth
					let blockOffsetY = y * board.blockWidth

					this.shadow[y][x].x = shadowX + blockOffsetX
					this.shadow[y][x].y = shadowY + blockOffsetY
				}
			}
		}

		this.isShadowVisible = fit

	}
	isPointInside(x, y) {
		let point = {
			x,
			y
		};
		let blocks = this.blocks;

		for (let x = 0; x < blocks.length; x++) {
			for (let y = 0; y < blocks[x].length; y++) {
				let block = blocks[x][y];
				if (block && block.isPointInside(point.x, point.y)) {
					return true;
				}
			}
		}
		return false;

	}
	placeOnBoard() {
		// Align this piece and its blocks on the board grid
		this.x = this.shadowIndexX * this.board.blockWidth + this.board.x;
		this.y = this.shadowIndexY * this.board.blockWidth + this.board.y;
		this.updateBlocksPosition();

		// Put each block of piece in the board
		for (let y in this.blocks) {
			for (let x in this.blocks[y]) {
				let block = this.blocks[y][x]
				
				if (block) {
					let indexX = this.shadowIndexX + Number(x)
					let indexY = this.shadowIndexY + Number(y)
					this.board.grid[indexY][indexX] = block
					this.renderer.include(block, 1)
				}
			}
		}

		// Remove this piece from screen and tray
		this.renderer.remove(this);
		this.traySpace.content = null;
		this.traySpace = null
	}
	onTouchStart(touch) {
		// Set dragging
		this.isBeingDragged = true
		touch.dragging = this
		touch.dragOffsetX = -(this.width / 2)
		touch.dragOffsetY = -(this.height) - 100
	}
	onDrop() {
		if (this.isShadowVisible) {
			this.placeOnBoard()
			piecesTray.showNewPiece(Piece)

			// Get row & columns that got filled
			let filledYs = this.board.checkYs()
			let filledXs = this.board.checkXs()
			// Clear them (if there are any)
			for (let indexY of filledYs)
				this.board.clearAlongY(indexY)
			for (let indexX of filledXs)
				this.board.clearAlongX(indexX)
			
			piecesTray.checkLost()
		} else {
			// Prepare an animation to get back to tray
			for (let space of piecesTray.spaces) {
				if (space.content != this) continue;

				this.targetX = space.x
				this.targetY = space.y
			}
		}
	}
	update() {
		if (this.isBeingDragged) {
			this.updateBlocksPosition();
			this.updateShadowPosition();
		} else if (this.targetX || this.targetY) {
			let diffX = this.targetX - this.x
			let diffY = this.targetY - this.y

			// Set a diagonal movement based on a proportion between
			// the complete movement and the hypotenuse
			let hypotenuse = Math.sqrt(diffX*diffX + diffY*diffY)
			let proportionX = diffX / hypotenuse
			let proportionY = diffY / hypotenuse
			let movementDiag = 20
			let movementX = proportionX * movementDiag
			let movementY = proportionY * movementDiag

			this.x += movementX
			this.y += movementY

			// End animation
			if (Math.abs(movementX) >= Math.abs(diffX)) {
				this.x = this.targetX
				this.targetX = null
			}
			if (Math.abs(movementY) >= Math.abs(diffY)) {
				this.y = this.targetY
				this.targetY = null
			}

			this.updateBlocksPosition()
		}
	}
	render(ctx) {
		// Render shadow
		if (this.isShadowVisible)
			for (let row of this.shadow)
				for (let item of row)
					if (item)
						item.render(ctx, this.renderer);


		// Render the actual blocks
		for (let row of this.blocks)
			for (let item of row)
				if (item)
					item.render(ctx, this.renderer);
	}
}

export default Piece