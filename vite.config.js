import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes the built files use relative paths, so the app
// works no matter what folder/URL GitHub Pages serves it from
// (e.g. https://username.github.io/quiz-app/).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
