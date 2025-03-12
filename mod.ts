/// <reference types="./deno.d.ts" />

/**
 * Deno Gun - A Deno-compatible version of the GUN database
 * Version: 0.2020.1235 (Based on GUN version with Deno adaptations)
 * 
 * This is an adaptation of the original GUN database by Mark Nadal,
 * modified for compatibility with Deno 2 by Kayode Bristol.
 */

// Main module for Deno Gun
import Gun from './gun-esm.js';
import SEA from './sea-esm.js';
import type { GunChain, GunConstructor } from './gun-esm.d.ts';
import type { KeyPair } from './sea-esm.d.ts';
import { serve } from "https://deno.land/std@0.220.1/http/server.ts";
import { serveDir } from "https://deno.land/std@0.220.1/http/file_server.ts";
import { parse } from "https://deno.land/std@0.220.1/flags/mod.ts";
import { join } from "https://deno.land/std@0.220.1/path/mod.ts";

// Export Gun and SEA
export { Gun, SEA };

// Export Gun options and utilities
export { GunOptions } from './gun-esm.js';
export {
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
} from './gun-esm.js';

// Export SEA utilities
export {
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
} from './sea-esm.js';

// Export types
export type { GunChain, GunConstructor, KeyPair };

// Configuration interface
interface GunConfig {
  port: number;
  dbFile: string;
  enableFrontend: boolean;
  publicDir: string;
}

// Parse command line arguments and environment variables
function getConfig(): GunConfig {
  const flags = parse(Deno.args, {
    boolean: ["frontend", "f"],
    string: ["port", "db", "public"],
    alias: { f: "frontend" },
    default: {
      frontend: false,
      port: Deno.env.get("PORT") || "8765",
      db: Deno.env.get("GUN_DB_FILE") || "gundb",
      public: "./public"
    },
  });

  return {
    port: parseInt(flags.port as string),
    dbFile: flags.db as string,
    enableFrontend: flags.frontend || flags.f,
    publicDir: flags.public as string,
  };
}

// Initialize Gun server with WebSocket support
async function initGunServer(config: GunConfig) {
  console.log("Starting Gun server...");
  
  // Initialize Gun with configuration
  const gun = Gun({
    web: config.port,
    file: config.dbFile,
    radisk: true, // Enable persistent storage
    multicast: false, // Disable multicast for Deno
  });

  // Create HTTP server with WebSocket upgrade support
  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    
    // Handle Gun WebSocket connections
    if (url.pathname === "/gun") {
      if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
        return await gun.server(req);
      }
      return new Response("WebSocket endpoint", { status: 426 });
    }
    
    // Serve static files for frontend
    if (config.enableFrontend) {
      try {
        return await serveDir(req, {
          fsRoot: config.publicDir,
          urlRoot: "",
          showIndex: true,
          showDirListing: false,
        });
      } catch (e) {
        console.error("Error serving static files:", e);
        return new Response("Internal Server Error", { status: 500 });
      }
    }
    
    return new Response("Not Found", { status: 404 });
  };

  // Start the server
  const server = serve(handler, { 
    port: config.port,
    onListen: ({ port, hostname }) => {
      console.log(`Gun server running on http://${hostname}:${port}`);
      console.log(`Using database file: ${config.dbFile}`);
      if (config.enableFrontend) {
        console.log(`Frontend UI enabled at http://${hostname}:${port}`);
      }
    }
  });

  return { gun, server };
}

// If this file is run directly, start the server
if (import.meta.main) {
  try {
    const config = getConfig();
    await initGunServer(config);
  } catch (error) {
    console.error("Failed to start server:", error);
    Deno.exit(1);
  }
}
