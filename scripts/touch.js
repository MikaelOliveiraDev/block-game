export default class Touch {
	constructor() {
		this.x = null;
		this.y = null;
		this.touching = false;
		this.touchingCount = 0;
		this.dragging = null;
		// Offset is used to the dragged object from the user's finger
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		this.rendererLayers = null
		this._canvas = null
	}

	get canvas() {
		return this._canvas
	}
	set canvas(value) {
		this._canvas = value
		this._canvas.addEventListener("touchstart", (ev) => this.touchstart(ev))
		this._canvas.addEventListener("touchmove", (ev) => this.touchmove(ev))
		this._canvas.addEventListener("touchend", (ev) => this.touchend(ev))
	}

	touchstart(ev) {
		ev.preventDefault();

		let touchEv = ev.touches[0];
		let rect = ev.target.getBoundingClientRect();

		let touchX = touchEv.clientX - rect.left;
		let touchY = touchEv.clientY - rect.top;

		this.x = touchX;
		this.y = touchY;
		this.touching = true;

		// Check if pick something on screen objs
		for (let layer of this.rendererLayers)
			if(layer) 
				for (let item of layer)
					if (item.isPointInside && item.isPointInside(touchX, touchY)) {
						item.onTouchStart(this)
					}
					
	}
	touchmove(ev) {
		ev.preventDefault();
		
		let touchEv = ev.touches[0];
		let rect = ev.target.getBoundingClientRect();

		let touchX = touchEv.clientX - rect.left;
		let touchY = touchEv.clientY - rect.top;

		this.x = touchX;
		this.y = touchY;
		
		if(this.dragging) {
			this.dragging.x = this.x + this.dragOffsetX
			this.dragging.y = this.y + this.dragOffsetY
			
			if(this.dragging.onTouchMove)
				this.dragging.onTouchMove(touch)
		}
	}
	touchend(ev) {
		this.x = null;
		this.y = null;
		this.touching = false;
		this.touchingCount = 0;

		if (this.dragging)
			this.drop()
	}
	update() {
		if (this.dragging) {
			this.dragging.x = this.x + this.dragOffsetX;
			this.dragging.y = this.y + this.dragOffsetY;
		}
	}
	drop() {
		if (this.dragging.onDrop)
			this.dragging.onDrop()

		this.dragging.isBeingDragged = false;
		this.dragging = null;
	}
}