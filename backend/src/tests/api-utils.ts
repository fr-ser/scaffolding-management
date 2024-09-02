import { Server } from "node:http";
import { AddressInfo } from "node:net";

import { USERS } from "@/config";
import { UserRole } from "@/global/types/backendTypes";

export function getRequest(
  server: Server,
  url: string,
  options: { userRole?: UserRole; method?: string } = {},
): Request {
  const defaultOptions = { userRole: UserRole.admin, method: "GET" };
  const finalOptions = { ...defaultOptions, ...options };

  const userName = Object.keys(USERS).find(
    (name) => USERS[name].role === finalOptions.userRole,
  ) as string;
  const password = USERS[userName].password;

  const port = (server.address() as AddressInfo).port;
  return new Request(`http://localhost:${port}/${url}`, {
    method: finalOptions.method,
    headers: {
      Authorization: "Basic " + Buffer.from(userName + ":" + password).toString("base64"),
    },
  });
}
