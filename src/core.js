// ESM wrapper for SEA (Security, Encryption, Authorization)
// This provides a modern ESM interface to the SEA module

// Environment detection
const isDenoEnv = typeof Deno !== 'undefined';
const isBrowserEnv = typeof window !== 'undefined';
const hasGlobal = typeof global !== 'undefined';
const globalThis = isBrowserEnv ? window : hasGlobal ? global : self;

// For Deno compatibility
if (isDenoEnv && !globalThis.process) {
  globalThis.process = { env: {} };
}

// Import core SEA implementation
import './sea.js';

// Get SEA from global scope (where the core implementation puts it)
const SEA = globalThis.SEA;

// Re-export SEA and its utilities
export { SEA as default };

// Export core cryptographic functions
export const {
  pair,
  sign,
  verify,
  encrypt,
  decrypt,
  work,
  random,
  hash,
  certify,
  proof,
} = SEA; 