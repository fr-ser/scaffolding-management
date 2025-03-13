import express from "express";
import basicAuth from "express-basic-auth";

import {
  USER_ADMIN_NAME,
  USER_ADMIN_PASSWORD,
  USER_EMPLOYEE_NAME,
  USER_EMPLOYEE_PASSWORD,
  USER_INVOICING_NAME,
  USER_INVOICING_PASSWORD,
  USER_PARTNER_NAME,
  USER_PARTNER_PASSWORD,
} from "@/config";
import { UserPermissions } from "@/global/types/backendTypes";

const adminPermissions = [
  UserPermissions.ARTICLES_VIEW,
  UserPermissions.ARTICLES_EDIT,
  UserPermissions.CLIENTS_EDIT,
  UserPermissions.DOCUMENTS_VIEW,
  UserPermissions.DOCUMENTS_EDIT,
  UserPermissions.DOCUMENTS_SEND_EMAIL,
  UserPermissions.ATTACHMENTS_EDIT,
  UserPermissions.SUB_ORDERS_VIEW,
  UserPermissions.SUB_ORDERS_EDIT,
  UserPermissions.ORDER_EDIT,
];

export const USERS = {
  [USER_ADMIN_NAME]: {
    password: USER_ADMIN_PASSWORD,
    permissions: adminPermissions,
  },
  [USER_PARTNER_NAME]: {
    password: USER_PARTNER_PASSWORD,
    permissions: adminPermissions,
  },
  [USER_INVOICING_NAME]: {
    password: USER_INVOICING_PASSWORD,
    permissions: [
      UserPermissions.ARTICLES_VIEW,
      UserPermissions.DOCUMENTS_VIEW,
      // TODO: check if invoicing can edit documents
      UserPermissions.SUB_ORDERS_VIEW,
      // TODO: check if invoicing can edit suboffers
      UserPermissions.DOCUMENTS_SEND_EMAIL,
    ],
  },
  [USER_EMPLOYEE_NAME]: {
    password: USER_EMPLOYEE_PASSWORD,
    permissions: [],
  },
};

export function getPermissionsForUser(user: string) {
  return USERS?.[user]?.permissions || [];
}

export function checkPermissionMiddleware(requiredPermission: UserPermissions) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const request = req as basicAuth.IBasicAuthedRequest;
    const userPermissions = getPermissionsForUser(request.auth.user);

    if (!userPermissions.includes(requiredPermission)) {
      res.status(403).send("Forbidden");
    } else next();
  };
}
