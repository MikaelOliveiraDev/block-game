import Touch from "./scripts/touch.js"
import Renderer from "./scripts/renderer.js"
import Block from "./scripts/block.js"
import Piece from "./scripts/piece.js"

import { piecesTray } from './scripts/pieces-tray.js';
import { pools } from './scripts/pools.js'
import { board } from "./scripts/board.js"

const canvas = document.querySelector("canvas");
const touch = new Touch()
const renderer = new Renderer(document.querySelector("canvas"))

touch.canvas = canvas
touch.rendererLayers = renderer.layers
piecesTray.renderer = renderer
renderer.include(board, 0)

const score = {
	current: 0,
	target: 0,
	x: null,
	y: null,
	init: function() {
		this.x = board.x + (board.width / 2)
		this.y = board.y / 2
		this.y = this.y > 16 ? this.y: 16
	},
	update: function() {
		// Score change animation
		if (this.current < this.target)
			this.current++
		else if (this.current > this.target)
			this.current--
	},
	render: function(ctx) {
		ctx.globalAlpha = 1
		ctx.fillStyle = "#ffffff"
		ctx.font = "50px sans-serif"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText(this.current, this.x, this.y)
	}
}

window.onload = () => {
	console.log("init game")
	canvas.height = 800;
	canvas.width = 450;
	
	board.init(canvas);
	piecesTray.init(board, renderer);
	piecesTray.showNewPiece(Piece, renderer);
	piecesTray.showNewPiece(Piece, renderer);
	piecesTray.showNewPiece(Piece, renderer);
	score.init()
	
	update();
};

function checkLost() {
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

function update() {
	requestAnimationFrame(update);

	touch.update();
	score.update()

	// Update each object on screen
	for (let layer of renderer.layers)
		if(layer)
			for (let item of layer)
				if (item.update) item.update();
	
	renderer.render();
}
/*
function render() {
	let ctx = canvas.getContext("2d");

	// Draw board spaces or items
	for (let indexY = 0; indexY < board.yLength; indexY++) {
		for (let indexX = 0; indexX < board.xLength; indexX++) {
			let onSpace = board.grid[indexY][indexX];

			if (onSpace == null) board.drawSpace(indexY, indexX, ctx);
			else onSpace.draw(ctx);
		}
	}

	piecesTray.draw(ctx);

	for (let frame of screen)
		for (let item of frame)
		if (item.draw) item.draw(ctx);

	score.draw(ctx)

}
*/