import { Server } from "node:http";
import { AddressInfo } from "node:net";

import { USERS } from "@/authorization";
import { USER_ADMIN_NAME } from "@/config";

/** Builds an authenticated `Request` against the given test server. */
export function getRequest(
  server: Server,
  url: string,
  options: {
    userName?: string;
    method?: string;
    params?: {
      [key: string]: string;
    };
    body?: Record<string, unknown>;
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
      ...(finalOptions.body ? { "Content-Type": "application/json" } : {}),
    },
    body: finalOptions.body ? JSON.stringify(finalOptions.body) : undefined,
  });
}
