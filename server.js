import { serve } from "bun";
import index from "./src/index.html";

const server = serve({
  routes: {
    "/": index,
    "/favicon.ico": Bun.file("./src/favicon.ico"),
    "/genlayer.svg": Bun.file("./src/genlayer.svg"),
  },
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);