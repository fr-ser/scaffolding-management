import fs from "node:fs";
import https from "node:https";
import { AddressInfo } from "node:net";

import {
  DB_PATH,
  HTTPS_CA_PATH,
  HTTPS_CERT_PATH,
  HTTPS_KEY_PATH,
  HTTPS_PORT,
  HTTP_PORT,
  USE_HTTPS,
} from "@/config";
import { closeDatabase, initializeAppDataSource } from "@/db";
import { log } from "@/helpers/logging";
import { getApp } from "@/main";

async function main() {
  log("Starting application");
  const app = getApp();

  await initializeAppDataSource(DB_PATH);
  log(`Initialized database at ${DB_PATH}`);

  if (USE_HTTPS) {
    const httpsServer = https
      .createServer(
        {
          key: fs.readFileSync(HTTPS_KEY_PATH as string),
          cert: fs.readFileSync(HTTPS_CERT_PATH as string),
          ca: fs.readFileSync(HTTPS_CA_PATH as string),
        },
        app,
      )
      .listen(HTTPS_PORT, () => {
        log(`HTTPS app started on port ${(httpsServer.address() as AddressInfo).port}`);
      });
  }

  const httpServer = app.listen(HTTP_PORT, () => {
    log(`HTTP app started on port ${(httpServer.address() as AddressInfo).port}`);
  });
}

main().catch((err) => {
  log(`Closing due to error: ${err}`);
  return closeDatabase();
});
