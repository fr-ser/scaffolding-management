import { AddressInfo } from "node:net";

import { DB_PATH, PORT } from "@/config";
import { closeDatabase, initializeAppDataSource } from "@/db";
import { sendMsgLog } from "@/helpers/logging";
import { getApp } from "@/main";

async function main() {
  sendMsgLog("Starting application");
  const app = getApp();

  await initializeAppDataSource(DB_PATH);
  sendMsgLog(`Initialized database at ${DB_PATH}`);

  const server = app.listen(PORT, () => {
    sendMsgLog(`Node app started on port ${(server.address() as AddressInfo).port}`);
  });
}

main().catch((err) => {
  sendMsgLog(`Closing due to error: ${err}`);
  return closeDatabase();
});
