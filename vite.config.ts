import { defineConfig, Plugin, ResolvedConfig } from "vite";
import WindiCSS from "vite-plugin-windicss";
import Vue from "@vitejs/plugin-vue";
// @ts-expect-error
import { writeFile, mkdir } from "fs/promises";
// @ts-expect-error
import path from "path";

// Hard-coded for now
// - assume index is "/src/main.tsx"
// - assume body has div#app
// - preamble code is better read from reactRefresh instead
const devIndexHtmlPlugin: () => Plugin = () => {
  let config: ResolvedConfig;
  return {
    name: "vite:logseq-dev-index-html-plugin",
    enforce: "pre",
    apply: "serve",
    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig;
    },
    buildStart: async (opt) => {
      const template = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <base href="http://${config.server.host}:${config.server.port}">
          <meta charset="UTF-8" />
          <script type="module" src="/@vite/client"></script>
          <link rel="icon" type="image/svg+xml" href="logo.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body>
          <div id="app"></div>
          <script type="module" src="/src/main.ts"></script>
        </body>
      </html>
      `;
      await mkdir(config.build.outDir, { recursive: true });
      await writeFile(
        path.resolve(config.build.outDir, "index.html"),
        template,
        {
          encoding: "utf-8",
        }
      );

      console.info("Wrote development index.html");
    },
  };
};

const windiCSS = WindiCSS();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [windiCSS, Vue(), devIndexHtmlPlugin()],
  base: "",
  clearScreen: false,
  // Makes HMR available for development
  server: {
    cors: true,
    host: "localhost",
    hmr: {
      host: "localhost",
    },
    port: 4568,
    strictPort: true,
  },
});
