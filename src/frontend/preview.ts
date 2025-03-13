import { serve } from "https://deno.land/std@0.220.1/http/server.ts";
import { serveDir } from "https://deno.land/std@0.220.1/http/file_server.ts";

const port = 3000;

async function startPreviewServer() {
  console.log(`Preview server running at http://localhost:${port}`);

  await serve(async (req) => {
    return await serveDir(req, {
      fsRoot: "../public",
      showDirListing: true,
      enableCors: true,
    });
  }, { port });
}

await startPreviewServer(); 