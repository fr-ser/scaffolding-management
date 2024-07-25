import path from "node:path";

import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import "dotenv/config";
import express from "express";
import basicAuth from "express-basic-auth";
import "source-map-support/register";

import { STATIC_FILE_ROOT, USERS } from "@/config";
import { apiErrorHandler, requestLogger, timeoutCheck } from "@/helpers/middleware";
import { articlesRouter } from "@/routes/articles";
import { clientsRouter } from "@/routes/clients";
import { documentsRouter } from "@/routes/documents";
import { ordersRouter } from "@/routes/orders";

export function getApp() {
  const app = express();

  app.use(cors());
  app.use(timeoutCheck);
  app.use(compression());

  app.use(requestLogger);

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  app.get("/api/health", (_, res) => {
    // this is a public endpoint (required for freshping)
    res.status(200).send("OK");
  });

  app.use(
    basicAuth({
      challenge: true,
      realm: "scaffolding",
      users: Object.entries(USERS).reduce(
        (acc, [name, { password }]) => {
          acc[name] = password;
          return acc;
        },
        {} as Record<string, string>,
      ),
    }),
  );

  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(bodyParser.text({ type: "text/plain", limit: "1mb" }));
  app.use(bodyParser.text({ type: "text/html", limit: "3mb" }));
  app.use(express.static(STATIC_FILE_ROOT));
  app.use("/api/clients", clientsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/articles", articlesRouter);
  app.use("/api/documents", documentsRouter);
  app.use(apiErrorHandler);

  // this "catch all" route is required for frontend routing
  app.get("*", (_, res) => {
    res.sendFile(path.resolve(path.join(STATIC_FILE_ROOT, "index.html")));
  });

  return app;
}

export function getHttpRedirectApp() {
  const app = express();

  app.use(requestLogger);

  // this endpoint needs to be public for SSL renewal
  app.get("/.well-known/acme-challenge/:fileName", (req, res) => {
    const filePath = path.resolve(
      path.join(
        STATIC_FILE_ROOT,
        ".well-known",
        "acme-challenge",
        path.basename(req.params.fileName),
      ),
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404);
      }
    });
  });

  app.use(function (request, response) {
    response.redirect("https://" + request.hostname + request.url);
  });
  return app;
}
