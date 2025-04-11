import { setTimeout } from "node:timers";

import express from "express";
import morgan from "morgan";

import { ErrorCode } from "@/global/types/backendTypes";
import { log } from "@/helpers/logging";

export function timeoutCheck(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  setTimeout(function timeoutTimer() {
    if (!res.headersSent) {
      log(`Possible timeout error: ${req.path} `);
    }
  }, 30000);
  next();
}

export const requestLogger = morgan(
  ":date[iso] :req[Host] :method :url :status :res[content-length] - :response-time ms",
  {
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    skip: function shouldLoggerSkip(req: express.Request, _: express.Response): boolean {
      if (req.originalUrl.startsWith("/assets")) return true;
      else if (req.originalUrl.startsWith("/api/health")) return true;
      else return false;
    },
  },
);

export function apiErrorHandler(
  err: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  _: express.Request, // eslint-disable-line @typescript-eslint/no-unused-vars
  res: express.Response,
  _2: express.NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  if (err.errorCode) {
    const status = err.errorStatus || 400;
    log(`Error: ${err.errorCode} - ${err}`);
    res.status(status).send({ error: { code: err.errorCode } });
  } else {
    log(`Error: Unknown - ${err}`);
    res.status(500).send({ error: { code: ErrorCode.INTERNAL } });
  }
}
