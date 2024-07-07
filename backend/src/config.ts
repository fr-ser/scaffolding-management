import dotenv from "dotenv";
import path from "path";

import { UserRole } from "@/global/types/backendTypes";

const DOTENV_FILE_PATH = process.env.CONFIG_PATH || ".env";
dotenv.config({ path: path.resolve(DOTENV_FILE_PATH) });

function getRequired(envKey: string): string {
  if (!process.env[envKey]) throw new Error(`missing environment variable: '${envKey}'`);
  return process.env[envKey] as string;
}

export const APP_SECRET = getRequired("APP_SECRET"); // session secret

export const PORT = process.env.PORT || 3001;
export const STATIC_FILE_ROOT = process.env.STATIC_FILE_ROOT || "static";
export const DROPBOX_ACCESS_TOKEN = getRequired("DROPBOX_ACCESS_TOKEN");
export const DAILY_BACKUP_COUNT = parseInt(getRequired("DAILY_BACKUP_COUNT"));
export const MONTHLY_BACKUP_COUNT = parseInt(getRequired("MONTHLY_BACKUP_COUNT"));

// Users
const USER_ADMIN_NAME = getRequired("USER_ADMIN_NAME");
const USER_ADMIN_PASSWORD = getRequired("USER_ADMIN_PASSWORD");
const USER_PARTNER_NAME = getRequired("USER_PARTNER_NAME");
const USER_PARTNER_PASSWORD = getRequired("USER_PARTNER_PASSWORD");
const USER_INVOICING_NAME = getRequired("USER_INVOICING_NAME");
const USER_INVOICING_PASSWORD = getRequired("USER_INVOICING_PASSWORD");
const USER_EMPLOYEE_NAME = getRequired("USER_EMPLOYEE_NAME");
const USER_EMPLOYEE_PASSWORD = getRequired("USER_EMPLOYEE_PASSWORD");

export const USERS = {
  [USER_ADMIN_NAME]: { password: USER_ADMIN_PASSWORD, role: UserRole.admin },
  [USER_PARTNER_NAME]: {
    password: USER_PARTNER_PASSWORD,
    role: UserRole.partner,
  },
  [USER_INVOICING_NAME]: {
    password: USER_INVOICING_PASSWORD,
    role: UserRole.invoicing,
  },
  [USER_EMPLOYEE_NAME]: {
    password: USER_EMPLOYEE_PASSWORD,
    role: UserRole.employee,
  },
};

// Database
export const DB_PATH = getRequired("DB_PATH");

// Email

// this is the email to contact the owner by
export const OWNER_EMAIL = getRequired("OWNER_EMAIL");

// this is the email to contact the technical support by
export const TECH_EMAIL = getRequired("TECH_EMAIL");
export const APP_MAIL_USER = getRequired("APP_MAIL_USER");
export const APP_MAIL_PASSWORD = getRequired("APP_MAIL_PASSWORD");
export const APP_MAIL_FROM = getRequired("APP_MAIL_FROM");
export const APP_MAIL_INVOICE_FROM = getRequired("APP_MAIL_INVOICE_FROM");
export const APP_MAIL_HOST = getRequired("APP_MAIL_HOST");
export const APP_MAIL_PORT = parseInt(getRequired("APP_MAIL_PORT"));

// this is the PDF/document content
export const COMPANY_NAME = getRequired("COMPANY_NAME");
export const COMPANY_STREET_AND_NUMBER = getRequired("COMPANY_STREET_AND_NUMBER");
export const COMPANY_POSTAL_CODE_AND_CITY = getRequired("COMPANY_POSTAL_CODE_AND_CITY");
export const COMPANY_TAX_CODE = getRequired("COMPANY_TAX_CODE");
export const COMPANY_VAT_CODE = getRequired("COMPANY_VAT_CODE");
export const COMPANY_OWNER = getRequired("COMPANY_OWNER");
export const COMPANY_PHONE = getRequired("COMPANY_PHONE");
export const COMPANY_MOBILE_PHONE = getRequired("COMPANY_MOBILE_PHONE");
export const COMPANY_EMAIL = getRequired("COMPANY_EMAIL");
export const COMPANY_HOMEPAGE = getRequired("COMPANY_HOMEPAGE");
export const COMPANY_BANK_NAME_1 = getRequired("COMPANY_BANK_NAME_1");
export const COMPANY_IBAN_1 = getRequired("COMPANY_IBAN_1");
export const COMPANY_BIC_1 = getRequired("COMPANY_BIC_1");
export const COMPANY_BANK_NAME_2 = getRequired("COMPANY_BANK_NAME_2");
export const COMPANY_IBAN_2 = getRequired("COMPANY_IBAN_2");
export const COMPANY_BIC_2 = getRequired("COMPANY_BIC_2");
