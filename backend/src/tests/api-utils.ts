import { Server } from "node:http";
import { AddressInfo } from "node:net";

import { USERS } from "@/authorization";
import { USER_ADMIN_NAME } from "@/config";

export function getRequest(
  server: Server,
  url: string,
  options: {
    userName?: string;
    method?: string;
    params?: {
      [key: string]: string;
    };
  } = {},
): Request {
  const defaultOptions = { userName: USER_ADMIN_NAME, method: "GET", params: {} };
  const finalOptions = { ...defaultOptions, ...options };

  const parsedParameters = new URLSearchParams(finalOptions.params);

  const password = USERS[finalOptions.userName].password;

  const port = (server.address() as AddressInfo).port;
  return new Request(`http://localhost:${port}/${url}?${parsedParameters}`, {
    method: finalOptions.method,
    headers: {
      Authorization:
        "Basic " + Buffer.from(finalOptions.userName + ":" + password).toString("base64"),
    },
  });
}
