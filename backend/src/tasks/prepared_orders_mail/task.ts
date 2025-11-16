import { DataSource } from "typeorm";

import { APP_MAIL_PAGE_URL, DB_PATH, OWNER_EMAIL } from "@/config";
import { initializeAppDataSource } from "@/db";
import { Order } from "@/db/entities/order";
import { OrderStatus } from "@/global/types/appTypes";
import { log } from "@/helpers/logging";
import { sendMail } from "@/services/email";

async function getPreparedOrders(dataSource: DataSource) {
  return await dataSource.manager.find(Order, { where: { status: OrderStatus.preparation } });
}

function getEmailContent(preparedOrders: Order[]) {
  const preparedOrdersText = preparedOrders
    .map((order) => `  - Auftrag: ${order.id} - ${order.title}`)
    .join("\n");

  return `Guten Tag,
die folgenden aufgebauten Aufträge liegen vor:

${preparedOrdersText}

Weitere Informationen gibt es in der Webanwendung selbst unter:
${APP_MAIL_PAGE_URL}/overview?report=preparedOrders
`.trim();
}

/**
 * Get a reminder about prepared orders
 */
async function preparedOrdersTask() {
  log("Starting prepared orders email task");

  const dataSource = await initializeAppDataSource(DB_PATH);

  const preparedOrders = await getPreparedOrders(dataSource);

  await sendMail([OWNER_EMAIL], "WebApp - Aufgebaute Aufträge", getEmailContent(preparedOrders));
}

preparedOrdersTask()
  .then(() => {
    log("prepared orders email task finished");
  })
  .catch((err) => {
    log("error in prepared orders email task", err);
  });
