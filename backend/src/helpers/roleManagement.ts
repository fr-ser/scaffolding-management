import express from 'express'

import { UserRole } from '@/global/types/backendTypes'

type MiddleWare = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void | express.Response

interface AuthOptions {
  yes?: UserRole[]
  no?: UserRole[]
  all?: true
}

/** This function generates an appropriate middleware based on the params
 * @param yes List of accepted roles
 * @param no List of not accepted roles
 * @param all Flag to allow all signed in users
 * @returns Express Middleware to check authentication
 */
export function checkAuth(options: { yes: UserRole[] }): MiddleWare
export function checkAuth(options: { no: UserRole[] }): MiddleWare
export function checkAuth(options: { all: true }): MiddleWare
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function checkAuth(_: AuthOptions): MiddleWare {
  return (_: express.Request, _2: express.Response, next: express.NextFunction) => {
    // TODO: add auth checks with basic auth
    next()
  }
}
