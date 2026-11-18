// Draws the living forest off the page (another processor core), so the fire never waits on it.
// The page asks for a step ({tick}); this answers with that step's 320x180 pixels ({tick, buf, ms}).
self.window = self;
importScripts('forest.js', 'soft.js');
const soft = softCtx(320, 180);
onmessage = e => {
  const a = performance.now();
  drawForest(soft, e.data.tick, 0, e.data.opts || { noPit: true });
  const buf = soft.img.data.slice().buffer;
  postMessage({ tick: e.data.tick, buf, ms: performance.now() - a }, [buf]);
};
