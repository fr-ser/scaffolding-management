import express from "express";
import { setTimeout } from "timers";

import { ErrorCode } from "@/global/types/backendTypes";
import { log } from "@/helpers/logging";

// eslint-disable-next-line  @typescript-eslint/no-unused-vars
export function noCache(_: express.Request, res: express.Response, next: express.NextFunction) {
  res.set({
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
    Expires: "-1",
    Pragma: "no-cache",
  });
  next();
}

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

// eslint-disable-next-line  @typescript-eslint/no-unused-vars
export function shouldLoggerSkip(req: express.Request, _: express.Response): boolean {
  if (req.originalUrl.startsWith("/img")) return true;
  else if (req.originalUrl.startsWith("/css")) return true;
  else if (req.originalUrl.startsWith("/js")) return true;
  else if (req.originalUrl.startsWith("/favicon")) return true;
  else if (req.originalUrl.startsWith("/manifest.webmanifest")) return true;
  else if (req.originalUrl.startsWith("/health")) return true;
  else return false;
}

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
