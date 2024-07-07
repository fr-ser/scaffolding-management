import { APP_MAIL_PAGE_URL, OWNER_EMAIL } from "@/config";
import { Invoice, Offer, Order, OverdueNotice } from "@/global/types/entities";
import { sendMail } from "@/send-mail";

const emailTemplate = (
  blockedOrderText: string,
  overdueOffersText: string,
  overdueInvoicesText: string,
  overdueOverdueNoticesText: string,
) =>
  `Guten Tag,
die folgenden Erinnerungen liegen vor:

${blockedOrderText}
${overdueOffersText}
${overdueInvoicesText}
${overdueOverdueNoticesText.trimEnd()}

Weitere Informationen gibt es in der Webanwendung selbst unter:
${APP_MAIL_PAGE_URL}
`.trim();

function blockedOrdersTemplate(orders: Order[]) {
  if (orders.length === 0) return "";

  let orderText = "Gesperrte Aufträge:\n";

  for (const order of orders) {
    orderText += `  - Auftrag: ${order.id} - ${order.title}\n`;
  }

  return orderText;
}
function overdueOffersTemplate(offers: Offer[]) {
  if (offers.length === 0) return "";

  let text = "Unbeantwortete Angebote:\n";

  for (const offer of offers) {
    text +=
      `  - Auftrag: ${offer.order_id}` +
      ` - ${offer.order.title}` +
      ` / Angebot von: ${offer.offered_at}` +
      `, gültig bis: ${offer.offer_valid_until}` +
      `\n`;
  }

  return text;
}

function getOverdueInvoicesTemplate(invoices: Invoice[]) {
  if (invoices.length === 0) return "";

  let text = "Überfällige Rechnungen:\n";

  for (const invoice of invoices) {
    text +=
      `  - Auftrag: ${invoice.order_id}` +
      ` - ${invoice.order.title}` +
      ` / Rechnung von: ${invoice.invoice_date}` +
      `, Zahlungsziel: ${invoice.payment_target}` +
      `\n`;
  }

  return text;
}

function getOverdueOverdueNotices(overdueNotice: OverdueNotice[]) {
  if (overdueNotice.length === 0) return "";

  let text = "Überfällige Mahnungen:\n";

  for (const invoice of overdueNotice) {
    text +=
      `  - Auftrag: ${invoice.order_id}` +
      ` - ${invoice.order.title}` +
      ` / Mahnung von: ${invoice.notice_date}` +
      `, Zahlungsziel: ${invoice.payment_target}` +
      `\n`;
  }

  return text;
}

export async function sendNotificationEmail(data: {
  blockedOrders: Order[];
  overdueOffers: Offer[];
  overdueInvoices: Invoice[];
  overdueOverdueNotices: OverdueNotice[];
}) {
  return await sendMail(
    [OWNER_EMAIL],
    "WebApp - Angebots- und Zahlungserinnerungen",
    emailTemplate(
      blockedOrdersTemplate(data.blockedOrders),
      overdueOffersTemplate(data.overdueOffers),
      getOverdueInvoicesTemplate(data.overdueInvoices),
      getOverdueOverdueNotices(data.overdueOverdueNotices),
    ),
  );
}
