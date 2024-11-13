import { DataSource } from "typeorm";

export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;
  console.log(entities);
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
}
