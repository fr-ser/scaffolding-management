import { Server } from "node:http";
import { AddressInfo } from "node:net";

export function getRequest(server: Server, url: string): Request {
  const port = (server.address() as AddressInfo).port;
  return new Request(`http://localhost:${port}/${url}`, {
    headers: {
      Authorization: "Basic " + Buffer.from("admin:local1").toString("base64"),
    },
  });
}
