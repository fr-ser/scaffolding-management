import { DB_PATH } from "@/config";
import { initializeAppDataSource } from "@/db";
import { log } from "@/helpers/logging";
import {
  getBlockedOrders,
  getOverdueInvoices,
  getOverdueOffers,
  getOverdueOverdueNotices,
} from "@/tasks/email_notification/data";
import { sendNotificationEmail } from "@/tasks/email_notification/email";

/**
 * Get a reminder about about:
 * - blocked orders
 * - overdue offers
 * - overdue invoices
 * - overdue "overdue notices"
 */
async function emailNotificationTask() {
  log("Starting email notification task");

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

emailNotificationTask()
  .then(() => {
    log("Email notification task finished");
  })
  .catch((err) => {
    log("Error in email notification task", err);
  });
