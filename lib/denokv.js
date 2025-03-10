;(function(){
  // Deno-specific storage adapter using Deno.Kv
  
  async function DenoKV(opt) {
    opt = opt || {};
    opt.file = String(opt.file || 'gundb');
    var store = DenoKV[opt.file];
    if(store){ return store }
    
    // Create the store instance
    store = DenoKV[opt.file] = function(){};
    
    // Open Deno.Kv database
    const kv = await Deno.openKv(opt.file);
    
    // Put data to Deno.Kv
    store.put = async function(key, data, cb) {
      try {
        await kv.set([key], data);
        cb(null, 1);
      } catch(err) {
        cb(err);
      }
    };
    
    // Get data from Deno.Kv
    store.get = async function(key, cb) {
      try {
        const result = await kv.get([key]);
        cb(null, result.value);
      } catch(err) {
        cb(err);
      }
    };
    
    // List keys with prefix
    store.list = async function(cb) {
      try {
        const iterator = kv.list({ prefix: [] });
        for await (const entry of iterator) {
          cb(entry.key[0]); // Pass the first part of the key
        }
        cb(); // Indicate end of list
      } catch(err) {
        cb();
      }
    };
    
    return store;
  }
  
  try {
    if (globalThis.Gun) {
      (DenoKV.window = globalThis).DenoKV = DenoKV;
      
      Gun.on('create', function(root) {
        this.to.next(root);
        root.opt.store = root.opt.store || DenoKV(root.opt);
      });
    }
  } catch(e) {}
}());
