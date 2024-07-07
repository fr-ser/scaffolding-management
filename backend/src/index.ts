import { AddressInfo } from "node:net";

import { DB_PATH, PORT } from "@/config";
import { closeDatabase, initializeAppDataSource } from "@/db";
import { log } from "@/helpers/logging";
import { getApp } from "@/main";

async function main() {
  log("Starting application");
  const app = getApp();

  await initializeAppDataSource(DB_PATH);
  log(`Initialized database at ${DB_PATH}`);

  const server = app.listen(PORT, () => {
    log(`Node app started on port ${(server.address() as AddressInfo).port}`);
  });
}

main().catch((err) => {
  log(`Closing due to error: ${err}`);
  return closeDatabase();
});
