import express from "express";
import basicAuth from "express-basic-auth";

import { USERS } from "@/config";
import { UserRole } from "@/global/types/backendTypes";

type MiddleWare = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void | express.Response;

interface AuthOptions {
  yes?: UserRole[];
  no?: UserRole[];
  all?: true;
}

function getRoleByUser(userName: string): UserRole {
  const foundUser = Object.entries(USERS).find(([name]) => name === userName);
  if (!foundUser) throw new Error("User not found");
  return foundUser[1].role;
}

/** This function generates an appropriate middleware based on the params
 * @param yes List of accepted roles
 * @param no List of not accepted roles
 * @param all Flag to allow all signed in users
 * @returns Express Middleware to check authentication
 */
export function checkAuth(options: { yes: UserRole[] }): MiddleWare;
export function checkAuth(options: { no: UserRole[] }): MiddleWare;
export function checkAuth(options: { all: true }): MiddleWare;
export function checkAuth(options: AuthOptions): MiddleWare {
  const { yes = [], no = [], all = false } = options ? options : { all: true };
  let allowedList: UserRole[];

  if (all) allowedList = Object.values(UserRole);
  else if (yes.length > 0) allowedList = yes;
  else if (no.length > 0) {
    allowedList = Object.values(UserRole).filter((role) => !no.includes(role));
  }

  return (req, res, next) => {
    const request = req as basicAuth.IBasicAuthedRequest;
    const role = getRoleByUser(request.auth.user);

    if (!allowedList.includes(role)) {
      res.status(403).send("Forbidden");
    } else next();
  };
}
