import express from "express";
import basicAuth from "express-basic-auth";

import { getPermissionsForUser } from "@/authorization";

export const usersRouter = express.Router();

usersRouter.get("", async (req: express.Request, res: express.Response) => {
  res.json({
    permissions: getPermissionsForUser((req as basicAuth.IBasicAuthedRequest).auth.user),
  });
});
