/**
 * Gun.js for Deno
 * This is the main entry point for using Gun with Deno
 */

// Import core files as ES modules
import './gun.js';
import './lib/denokv.js';

// Optionally import common extensions
// Note: Users can import these separately if needed
import './sea.js'; 
import './lib/then.js';
import './lib/radix.js';
import './lib/radisk.js';
import './lib/store.js';
import './lib/rindexed.js';

// Export Gun for ES module usage
export default globalThis.Gun;
