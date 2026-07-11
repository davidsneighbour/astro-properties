import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [mdx(), react()],
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss(), basicSsl()],
  },
});
