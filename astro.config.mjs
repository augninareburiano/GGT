// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

// Server-rendered output so /api/* endpoints run as Netlify Functions.
// See https://docs.astro.build/en/guides/integrations-guide/netlify/
export default defineConfig({
  output: "server",
  adapter: netlify(),
});
