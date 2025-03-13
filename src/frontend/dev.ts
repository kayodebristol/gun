import { serve } from "https://deno.land/std@0.220.1/http/server.ts";
import { serveDir } from "https://deno.land/std@0.220.1/http/file_server.ts";

const port = 3000;

async function startServer() {
  console.log(`HTTP webserver running at http://localhost:${port}`);

  await serve(async (req) => {
    const url = new URL(req.url);
    
    // Serve static files from the frontend directory
    if (url.pathname.startsWith("/assets/")) {
      return await serveDir(req, {
        fsRoot: ".",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
      });
    }

    // For all other routes, serve the index.html
    return new Response(await Deno.readFile("./index.html"), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }, { port });
}

await startServer(); 