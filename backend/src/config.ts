import dotenv from "dotenv";
import path from "path";

import { UserRole } from "@/global/types/backendTypes";

const DOTENV_FILE_PATH = process.env.CONFIG_PATH || ".env";
dotenv.config({ path: path.resolve(DOTENV_FILE_PATH) });

function getRequired(envKey: string): string {
  if (!process.env[envKey]) throw new Error(`missing environment variable: '${envKey}'`);
  return process.env[envKey] as string;
}

export const USE_HTTPS = process.env.USE_HTTPS === "true";
export const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
export const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;
export const HTTPS_CA_PATH = process.env.HTTPS_CA_PATH;
export const HTTPS_PORT = process.env.HTTPS_PORT;
if (USE_HTTPS) {
  getRequired("HTTPS_KEY_PATH");
  getRequired("HTTPS_KEY_PATH");
  getRequired("HTTPS_CERT_PATH");
  getRequired("HTTPS_PORT");
}

export const HTTP_PORT = process.env.HTTP_PORT || 3001;
export const STATIC_FILE_ROOT = process.env.STATIC_FILE_ROOT || "static";
export const DROPBOX_PATH_PREFIX = "/v3/";
export const DROPBOX_REFRESH_TOKEN = getRequired("DROPBOX_REFRESH_TOKEN");
export const DROPBOX_CLIENT_ID = getRequired("DROPBOX_CLIENT_ID");
export const DROPBOX_CLIENT_SECRET = getRequired("DROPBOX_CLIENT_SECRET");
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
export const APP_MAIL_PAGE_URL = getRequired("APP_MAIL_PAGE_URL");
// this is the PDF/document content
export const COMPANY_NAME = getRequired("VITE_COMPANY_NAME");
export const COMPANY_STREET_AND_NUMBER = getRequired("VITE_COMPANY_STREET_AND_NUMBER");
export const COMPANY_POSTAL_CODE_AND_CITY = getRequired("VITE_COMPANY_POSTAL_CODE_AND_CITY");
export const COMPANY_TAX_CODE = getRequired("VITE_COMPANY_TAX_CODE");
export const COMPANY_VAT_CODE = getRequired("VITE_COMPANY_VAT_CODE");
export const COMPANY_OWNER = getRequired("VITE_COMPANY_OWNER");
export const COMPANY_PHONE = getRequired("VITE_COMPANY_PHONE");
export const COMPANY_MOBILE_PHONE = getRequired("VITE_COMPANY_MOBILE_PHONE");
export const COMPANY_EMAIL = getRequired("VITE_COMPANY_EMAIL");
export const COMPANY_HOMEPAGE = getRequired("VITE_COMPANY_HOMEPAGE");
export const COMPANY_BANK_NAME_1 = getRequired("VITE_COMPANY_BANK_NAME_1");
export const COMPANY_IBAN_1 = getRequired("VITE_COMPANY_IBAN_1");
export const COMPANY_BIC_1 = getRequired("VITE_COMPANY_BIC_1");
export const COMPANY_BANK_NAME_2 = getRequired("VITE_COMPANY_BANK_NAME_2");
export const COMPANY_IBAN_2 = getRequired("VITE_COMPANY_IBAN_2");
export const COMPANY_BIC_2 = getRequired("VITE_COMPANY_BIC_2");
