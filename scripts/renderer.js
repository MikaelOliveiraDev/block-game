class Renderer {
	constructor(canvas) {
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.layers = []
		this.images = {
			blocks: []
		}
		
		// Set images for blocks 
		for (let i = 0; i < 5; i++) {
			let img = new Image();
			img.src = `./assets/block-${i}.png`;
			this.images.blocks.push(img);
		}
	}
	
	include(item, zIndex) {
		/* Inclue item in the rendering */
		if(!this.layers[zIndex])
			this.layers[zIndex] = []
		
		item.renderer = this
		item.zIndex = zIndex
		this.layers[zIndex].push(item)
	}
	remove(item) {
		let zIndex = item.zIndex
		let layer = this.layers[zIndex]
		if(!layer)
			return console.error(`Layer with zIndex "${zIndex}" not found.`)
		
		item.renderer = null
		let index = layer.indexOf(item);
		let isIncluded = index != -1
		
		if(isIncluded)
			layer.splice(index, 1)
	}
	render() {
		// Paint the hole canvas
		this.ctx.fillStyle = "#4f6875";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		// Render the items in the order of layers
		for(let layer of this.layers)
			if(layer)
				for(let item of layer) 
					item.render(this.ctx, this)
	}
}

export default Renderer