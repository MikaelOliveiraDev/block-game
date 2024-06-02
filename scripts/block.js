import { board } from "./board.js"

class Block {
	constructor() {
		this.x = null;
		this.y = null;
		this.width = board.blockWidth;
		this.imageIndex = null;
		this.globalAlpha = 1;
		this.zIndex = 0;
	}
	
	render(ctx, renderer) {
		renderer = renderer || this.renderer
		let img = renderer.images.blocks[this.imageIndex]
		
		ctx.globalAlpha = this.globalAlpha;
		ctx.drawImage(img, this.x, this.y, this.width, this.width);
		ctx.globalAlpha = 1;
	}
	isPointInside(x, y) {
		let top = this.y;
		let right = this.x + this.width;
		let bottom = this.y + this.width;
		let left = this.x;

		if (left < x && x < right) if (top < y && y < bottom) return true;

		return false;
	}
}

export default Block 