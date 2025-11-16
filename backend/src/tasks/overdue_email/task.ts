import { DB_PATH } from "@/config";
import { initializeAppDataSource } from "@/db";
import { log } from "@/helpers/logging";
import {
  getBlockedOrders,
  getOverdueInvoices,
  getOverdueOffers,
  getOverdueOverdueNotices,
} from "@/tasks/overdue_email/data";
import { sendNotificationEmail } from "@/tasks/overdue_email/email";

/**
 * Get a reminder about about:
 * - blocked orders
 * - overdue offers
 * - overdue invoices
 * - overdue "overdue notices"
 */
async function overdueEmailTask() {
  log("starting overdue email task");

  const dataSource = await initializeAppDataSource(DB_PATH);

  const data = await Promise.all([
    getBlockedOrders(dataSource),
    getOverdueOffers(dataSource),
    getOverdueInvoices(dataSource),
    getOverdueOverdueNotices(dataSource),
  ]);

  await sendNotificationEmail({
    blockedOrders: data[0],
    overdueOffers: data[1],
    overdueInvoices: data[2],
    overdueOverdueNotices: data[3],
  });
}

overdueEmailTask()
  .then(() => {
    log("overdue email task finished");
  })
  .catch((err) => {
    log("Error in overdue email task", err);
  });
