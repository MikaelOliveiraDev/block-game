import { board } from "./board.js"
import { pools } from "./pools.js"

export const piecesTray = {
	spaces: [],
	spacesLength: 3,
	width: null,
	height: 100,
	renderer: null,
	init: function(board) {
		this.width = board.width
		this.x = board.x 
		this.y = board.y
		
		for(let i = 0; i < this.spacesLength; i++) {
			let marginTop = 50
			let space = {}
			space.width = this.width / this.spacesLength
			space.x = space.width * i + this.x
			space.y = board.y + board.height + marginTop
			space.content = null
			
			space.render = function(ctx) {
				ctx.strokeRect(this.x, this.y, this.width, this.width)
			}
			space.isPointInside = function(x, y) {
				let x0 = this.x
				let x1 = this.x + this.width
				let y0 = this.y
				let y1 = this.y + this.width
				if(x0 < x && x < x1 && y0 < y && y < y1) 
					return true 
				
				return false
			}
			space.onTouchStart = function(touch) {
				this.content.onTouchStart(touch)
			}
			
			this.spaces.push(space)
			this.renderer.include(space, 0)
		}
	},
	showNewPiece: function(Piece) {
		// Try to find an empty space 
		for(let space of this.spaces) {
			if(space.content) continue
			// Config the piece
			let piece = new Piece(board)
			piece.x = space.x 
			piece.y = space.y
			piece.init(board)
			piece.updateBlocksPosition()
			piece.traySpace = space
			space.content = piece
			
			this.renderer.include(piece, 2)
			break;
		}
	},
	checkLost: function() {
		for (let space of piecesTray.spaces) {
			let piece = space.content
			let maxIndexY = board.yLength - piece.blocks.length
			let maxIndexX = board.xLength - piece.blocks[0].length

			// Check if fit on any part of the board grid
			for (let indexY in board.grid) {
				for (let indexX in board.grid[indexY]) {
					if (indexX > maxIndexX || indexY > maxIndexY) continue
					if (board.grid[indexY][indexX]) continue

					let fit = board.checkFit(piece, indexY, indexX)
					
					if (fit) return
				}
			}
		}

		alert("You've lost! Refresh the page to play again.")
	}

}