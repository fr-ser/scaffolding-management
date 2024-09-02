import { DataSource } from "typeorm";

import { getDataSourceConfig } from "@/db/dataSource";
import { log } from "@/helpers/logging";

let AppDataSource: DataSource;

export function getAppDataSource() {
  if (!AppDataSource) {
    throw new Error("AppDataSource is not initialized");
  }
  return AppDataSource;
}

export async function initializeAppDataSource(databasePath: string) {
  AppDataSource = new DataSource(getDataSourceConfig(databasePath));
  await AppDataSource.initialize();
  await AppDataSource.createQueryRunner().query("PRAGMA foreign_keys=ON");
  const foreignKeyResult = await AppDataSource.createQueryRunner().query("PRAGMA foreign_keys");
  if (foreignKeyResult[0].foreign_keys !== 1) {
    throw new Error(`Failed to enable foreign keys. Got: ${JSON.stringify(foreignKeyResult)}`);
  }
  return AppDataSource;
}

export async function closeDatabase() {
  if (AppDataSource) {
    await AppDataSource.destroy();
    log(`Closed database`);
  }
}
