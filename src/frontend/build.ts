import { build } from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts";
import { sveltePlugin } from "https://deno.land/x/esbuild_svelte@0.0.4/mod.ts";

async function buildApp() {
  try {
    const result = await build({
      entryPoints: ["./src/main.ts"],
      bundle: true,
      outfile: "../public/bundle.js",
      format: "esm",
      platform: "browser",
      target: "esnext",
      plugins: [
        ...denoPlugins(),
        sveltePlugin(),
      ],
      sourcemap: true,
      minify: true,
    });

    console.log("Build completed:", result);
  } catch (error) {
    console.error("Build failed:", error);
    Deno.exit(1);
  }
}

await buildApp(); 