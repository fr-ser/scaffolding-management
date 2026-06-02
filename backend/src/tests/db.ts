import { DataSource } from "typeorm";

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;

  await dataSource.query("PRAGMA foreign_keys = OFF");
  try {
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  } finally {
    await dataSource.query("PRAGMA foreign_keys = ON");
  }
}
