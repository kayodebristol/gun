// ESM wrapper for Gun
// This provides a modern ESM interface to the Gun database

// Environment detection
const isDenoEnv = typeof Deno !== 'undefined';
const isBrowserEnv = typeof window !== 'undefined';
const hasGlobal = typeof global !== 'undefined';
const globalThis = isBrowserEnv ? window : hasGlobal ? global : self;

// For Deno compatibility
if (isDenoEnv && !globalThis.process) {
  globalThis.process = { env: {} };
}

// Import core Gun implementation
import './gun.js';

// Get Gun from global scope (where the core implementation puts it)
const Gun = globalThis.Gun;

// Create a wrapper function that maintains both constructor and function call behavior
const GunWrapper = function(options) {
  if (!(this instanceof GunWrapper)) {
    return new Gun(options);
  }
  return Gun.call(this, options);
};

// Copy all properties from Gun to GunWrapper
Object.assign(GunWrapper, Gun);
GunWrapper.prototype = Gun.prototype;

// Re-export core Gun and its utilities
export { GunWrapper as default };
export const GunOptions = {
  file: false, // Disable file persistence by default in Deno
  localStorage: false, // Disable localStorage in Deno
  radisk: true, // Enable radisk storage
  memory: true, // Enable in-memory storage
};

// Export utility functions
export const { 
  node,
  chain,
  back,
  val,
  text,
  json,
  on,
  map,
  set,
  path,
  not,
  lex,
} = Gun.chain; 