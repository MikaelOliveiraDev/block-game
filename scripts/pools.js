const pools = {
	map: new Map(),
	
	get: function (clss) {
		if(!this.map.has(clss)) 
			this.map.set(clss, [])
		
		let pool = this.map.get(clss)
		if(pool.length === 0)
			return new clss()
		else
			return pool.pop()
},
	put: function(obj) {
		let clss = obj.constructor
		
		if(!this.map.has(clss))
			this.map.set(clss, [])
		
		this.map.get(clss).push(obj)
	}
}

export { pools };