// Create a global object for Node.js/Deno compatibility
const globalThis = (typeof window !== 'undefined' ? window : 
                   typeof global !== 'undefined' ? global : 
                   typeof self !== 'undefined' ? self : {});

// Initialize process.env for Gun compatibility
if (!globalThis.process) {
  globalThis.process = { env: {} };
}

// Import Gun core
await import('./gun.js');

// Export Gun from the global object
const Gun = globalThis.Gun;
export default Gun; 