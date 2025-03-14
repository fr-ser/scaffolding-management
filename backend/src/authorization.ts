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
  UserPermissions.ARTICLES_EDIT,
  UserPermissions.ARTICLES_VIEW,
  UserPermissions.ATTACHMENTS_EDIT,
  UserPermissions.CLIENTS_EDIT,
  UserPermissions.DOCUMENTS_EDIT,
  UserPermissions.DOCUMENTS_SEND_EMAIL,
  UserPermissions.DOCUMENTS_VIEW,
  UserPermissions.ORDERS_CREATE_DELETE,
  UserPermissions.ORDERS_UPDATE,
  UserPermissions.SUB_ORDERS_EDIT,
  UserPermissions.SUB_ORDERS_VIEW,
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
      UserPermissions.DOCUMENTS_EDIT,
      UserPermissions.DOCUMENTS_SEND_EMAIL,
      UserPermissions.DOCUMENTS_VIEW,
      UserPermissions.ORDERS_UPDATE,
      UserPermissions.SUB_ORDERS_EDIT,
      UserPermissions.SUB_ORDERS_VIEW,
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
