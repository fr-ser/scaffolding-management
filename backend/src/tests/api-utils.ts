import { Server } from "node:http";
import { AddressInfo } from "node:net";

import { USERS } from "@/config";
import { UserRole } from "@/global/types/backendTypes";

export function getRequest(server: Server, url: string, userRole = UserRole.admin): Request {
  const userName = Object.keys(USERS).find((name) => USERS[name].role === userRole) as string;
  const password = USERS[userName].password;

  const port = (server.address() as AddressInfo).port;
  return new Request(`http://localhost:${port}/${url}`, {
    headers: {
      Authorization: "Basic " + Buffer.from(userName + ":" + password).toString("base64"),
    },
  });
}
