import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import "dotenv/config";
import express from "express";
import basicAuth from "express-basic-auth";
import morgan from "morgan";
import "source-map-support/register";

import { STATIC_FILE_ROOT, USERS } from "@/config";
import { apiErrorHandler, shouldLoggerSkip, timeoutCheck } from "@/helpers/middleware";
import { articlesRouter } from "@/routes/articles";
import { clientsRouter } from "@/routes/clients";
import { documentsRouter } from "@/routes/documents";
import { ordersRouter } from "@/routes/orders";

export function getApp() {
  const app = express();

  // this is a public endpoint (required for freshping)
  app.get("/api/health", (_: express.Request, res: express.Response) => {
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

  app.use(
    morgan(":date[iso] :method :url :status :res[content-length] - :response-time ms", {
      skip: shouldLoggerSkip,
    }),
  );
  app.use(cors());
  app.use(timeoutCheck);
  app.use(compression());
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(bodyParser.text({ type: "text/plain", limit: "1mb" }));
  app.use(bodyParser.text({ type: "text/html", limit: "3mb" }));
  app.use(express.static(STATIC_FILE_ROOT));
  app.use("/api/clients", clientsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/articles", articlesRouter);
  app.use("/api/documents", documentsRouter);
  app.use(apiErrorHandler);

  return app;
}
