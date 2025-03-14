import { DB_PATH } from "@/config";
import { initializeAppDataSource } from "@/db";
import { log } from "@/helpers/logging";
import { backupDocuments } from "@/tasks/backup/document_backup";

import { backupDatabase } from "./database_backup";

/**
 * Make a backup of the database and documents:
 * - store all new documents as PDFs
 * - store a copy of the database
 * - clean up old database backup
 */
async function backupTask() {
  log("Starting backup task");

  const dataSource = await initializeAppDataSource(DB_PATH);

  await backupDocuments(dataSource);
  await backupDatabase();
}

backupTask()
  .then(() => {
    log("backup task finished");
  })
  .catch((err) => {
    log("Error in backup task", err);
  });
