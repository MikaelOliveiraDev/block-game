const composition = {
  // the items that are present in the screen/game
  layers: [],
  instances: [],
};

composition.include = function (item, layer) {
  let instance = item.constructor.name;

  let layers = this.layers;
  let instances = this.instances;

  if (!layers[layer]) layers[layer] = [];
  if (!instances[instance]) instances[instance] = [];

  layers[layer].push(item);
  instances[instance].push(item);
  item._layer = layer;
};
composition.remove = function (item) {
  let instance = item.constructor.name;

  let instances = this.instances;
  let layers = this.layers;

  let instanceIndex = instances[instance].indexOf(item);
  let layerIndex = layers[item._layer].indexOf(item);

  instances[instance].splice(instanceIndex, 1);
  layers[item._layer].splice(layerIndex, 1);

  return item;
};
composition.loopThroughItems = function (func) {
  // The parameter func:
  //    - must be a function that is executated for every item in the composition.
  //    - the item is passed to its first argument, and the layer the second.
  //    - the return value should be a boolean that determines whether the loop should continue;

  let layers = composition.layers;
  for (let i = 0; i < layers.length; i++) {
    let layer = layers[i];
    if (!layer) continue;

    for (let ii = 0; ii < layer.length; ii++) {
      let item = layer[ii];
      if (item) {
        let continueLoop = func(item, layer);

        if (continueLoop === false) return;
      }
    }
  }
};

export default composition;