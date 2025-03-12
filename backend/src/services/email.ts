import { createTransport } from "nodemailer";

import {
  APP_MAIL_FROM,
  APP_MAIL_HOST,
  APP_MAIL_PASSWORD,
  APP_MAIL_PORT,
  APP_MAIL_USER,
} from "@/config";
import { log } from "@/helpers/logging";

interface AttachmentInterface {
  filename: string;
  content: string;
}

const transporter = createTransport({
  host: APP_MAIL_HOST,
  port: APP_MAIL_PORT,
  secure: true,
  auth: { user: APP_MAIL_USER, pass: APP_MAIL_PASSWORD },
});

export async function sendMail(
  toEmails: string[],
  subject: string,
  message: string,
  attachments = [] as AttachmentInterface[],
  fromEmail: string = APP_MAIL_FROM,
) {
  log(`Sending e-mail for subject: ${subject}`);

  return transporter.sendMail({
    from: fromEmail,
    to: toEmails.join(","),
    bcc: fromEmail,
    subject: subject,
    text: message,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      encoding: "base64",
    })),
  });
}
