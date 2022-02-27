import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import { Server, WebSocket } from "ws";

import * as serverBuild from "@remix-run/dev/server-build";

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public/build", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })
);

const server = require("http").createServer();
const wss = new Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log("Received message:\n\t %s", message);

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message, { binary: false });
      }
    });
  });
});

wss.on("error", () => {
  console.log("Client refreshed");
});

server.on("request", app);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Http server listening on port ${port}`);
});
