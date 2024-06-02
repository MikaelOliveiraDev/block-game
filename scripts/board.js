import { pools } from "./pools.js"
class Board {
	constructor() {
		this.grid = []
		this.x = 0
		this.y = 0
		this.width = null
		this.height = null
		this.xLength = 8
		this.yLength = 10
		this.blockWidth = 38
	}

	init(canvas) {
		console.log(this)
		// Define dimentions
		this.width = this.blockWidth * this.xLength;
		this.height = this.blockWidth * this.yLength;
		// Define position
		this.x = (canvas.width - this.width) / 2
		this.y = 0
		// Prepare the grid
		for (let indexY = 0; indexY < this.yLength; indexY++) {
			this.grid[indexY] = [];
			for (let indexX = 0; indexX < this.xLength; indexX++) {
				this.grid[indexY][indexX] = null;
			}
		}
	}

	checkYs() {
		// Check if some rows are filled

		let filledYs = []
		for (let indexY in this.grid) {
			let containsEmptyParts = false

			for (let indexX in this.grid[indexY]) {

				if (this.grid[indexY][indexX]) continue
				else containsEmptyParts = true
				break
			}

			if (!containsEmptyParts)
				filledYs.push(indexY)
		}
		return filledYs
	}
	checkXs() {
		// Check if some columns are filled

		let filledXs = []
		for (let indexX = 0; indexX < this.xLength; indexX++) {
			let containsEmptyParts = false

			for (let indexY = 0; indexY < this.yLength; indexY++) {
				if (this.grid[indexY][indexX]) continue
				else containsEmptyParts = true

				break
			}

			if (!containsEmptyParts)
				filledXs.push(indexX)
		}

		return filledXs
	}
	clearAlongY(indexY) {
		let targetScore = 0
		for (let indexX = 0; indexX < this.xLength; indexX++) {
			pools.put(this.grid[indexY][indexX], "blocks")
			this.grid[indexY][indexX] = null
			targetScore++
		}
		score.target += targetScore
	}
	clearAlongX(indexX) {
		let targetScore = 0
		for (let indexY = 0; indexY < this.yLength; indexY++) {
			pools.put(this.grid[indexY][indexX], "blocks")
			this.grid[indexY][indexX] = null
			targetScore++
		}
		score.target += targetScore
	}
	checkFit(piece, desY, desX) {
		/* Check if board.grid has space to fit a piece in the given indexes. */
		/* desX => destination index in which the piece would be placed */
		/* blcX => block index relative to the piece index */
		/* brdX => board space index in which the block would be placed */
		desX = Number(desX)
		desY = Number(desY)

		for (let blcY in piece.blocks) {
			for (let blcX in piece.blocks[blcY]) {
				if (!piece.blocks[blcY][blcX]) continue;

				blcX = Number(blcX)
				blcY = Number(blcY)

				let brdX = desX + blcX
				let brdY = desY + blcY

				if (this.grid[brdY][brdX])
					return false
			}
		}

		return true
	}
	render(ctx) {
		// Board background
		ctx.fillStyle = "#464646"
		ctx.fillRect(this.x, this.y, this.width, this.height)
		
		// Horizontal lines
		for (let indexY in this.grid) {
			ctx.beginPath()
			let x0 = this.x
			let x1 = this.x + this.width
			let y = this.y + (indexY * this.blockWidth)
			ctx.moveTo(x0, y)
			ctx.lineTo(x1, y)
			ctx.stroke()
			ctx.closePath()
		}
		// Vertical lines
		for (let indexX in this.grid[0]) {
			ctx.beginPath()
			let x = this.x + (indexX * this.blockWidth)
			let y0 = this.y
			let y1 = this.y + this.height
			ctx.moveTo(x, y0)
			ctx.lineTo(x, y1)
			ctx.stroke()
			ctx.closePath()
		}
	}
}

export const board = new Board()