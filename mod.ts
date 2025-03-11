/**
 * Deno Gun - A Deno-compatible version of the GUN database
 * Version: 0.2020.1235 (Based on GUN version with Deno adaptations)
 * 
 * This is an adaptation of the original GUN database by Mark Nadal,
 * modified for compatibility with Deno by Kayode Bristol.
 */

// Import core Gun functionality
import { Gun } from "./gun.js";
import SEA from "./sea.js";
import { serve } from "https://deno.land/std/http/server.ts";
import { serveDir } from "https://deno.land/std/http/file_server.ts";

// Export the main components
export { Gun, SEA };

// Re-export any other necessary components
export * from "./lib/index.js";

// Default export for convenience
export default Gun;

// If this file is run directly, start a Gun server
if (import.meta.main) {
  // Parse command line arguments
  const enableFrontend = Deno.args.includes('--frontend') || Deno.args.includes('-f');
  const port = parseInt(Deno.env.get("PORT") || "8765");
  const dbFile = Deno.env.get("GUN_DB_FILE") || "gundb";
  
  console.log("Starting Gun server...");
  
  // Initialize Gun
  const gun = Gun({
    web: port,
    file: dbFile
  });
  
  console.log(`Gun server running on port ${gun._.opt.web}`);
  console.log(`Using database file: ${gun._.opt.file}`);
  
  // If frontend is enabled, serve Svelte app
  if (enableFrontend) {
    console.log("Frontend UI enabled at http://localhost:" + port);
    
    // Create HTTP server
    serve(async (req) => {
      const url = new URL(req.url);
      
      // Serve Gun WebSocket on /gun
      if (url.pathname === "/gun") {
        return gun.server(req);
      }
      
      // Serve static frontend files
      return await serveDir(req, {
        fsRoot: "./public",
        urlRoot: "",
        showIndex: true,
        showDirListing: false,
      });
    }, { port });
  }
}
