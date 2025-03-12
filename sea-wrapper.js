// Create a global object for Node.js/Deno compatibility
const globalThis = (typeof window !== 'undefined' ? window : 
                   typeof global !== 'undefined' ? global : 
                   typeof self !== 'undefined' ? self : {});

// Initialize process.env for SEA compatibility
if (!globalThis.process) {
  globalThis.process = { env: {} };
}

// Import SEA core
await import('./sea.js');

// Export SEA from the global object
const SEA = globalThis.SEA;
export default SEA; 