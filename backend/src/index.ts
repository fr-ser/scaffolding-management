import fs from "node:fs";
import https from "node:https";
import { AddressInfo } from "node:net";

import { DB_PATH, HTTPS_CA_PATH, HTTPS_CERT_PATH, HTTPS_KEY_PATH, PORT, USE_HTTPS } from "@/config";
import { closeDatabase, initializeAppDataSource } from "@/db";
import { log } from "@/helpers/logging";
import { getApp } from "@/main";

async function main() {
  log("Starting application");
  const app = getApp();

  await initializeAppDataSource(DB_PATH);
  log(`Initialized database at ${DB_PATH}`);

  if (USE_HTTPS) {
    const server = https
      .createServer(
        {
          key: fs.readFileSync(HTTPS_KEY_PATH as string),
          cert: fs.readFileSync(HTTPS_CERT_PATH as string),
          ca: fs.readFileSync(HTTPS_CA_PATH as string),
        },
        app,
      )
      .listen(PORT, () => {
        log(`Node app started on port ${(server.address() as AddressInfo).port} with https`);
      });
  } else {
    const server = app.listen(PORT, () => {
      log(`Node app started on port ${(server.address() as AddressInfo).port}`);
    });
  }
}

main().catch((err) => {
  log(`Closing due to error: ${err}`);
  return closeDatabase();
});
