import express from "express";

import { getAppDataSource } from "@/db";
import { Client } from "@/db/entities/client";
import { Order } from "@/db/entities/order";
import {
  ErrorCode,
  PaginationQueryParameters,
  PaginationResponse,
  UserRole,
} from "@/global/types/backendTypes";
import { ApiError, SQLITE_CONSTRAINT_ERROR_CODE } from "@/helpers/apiErrors";
import { noCache } from "@/helpers/middleware";
import { checkAuth } from "@/helpers/roleManagement";

export const clientsRouter = express.Router();
clientsRouter.use(noCache);

clientsRouter.get(
  "/",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response) => {
    const { skip = 0, take = 100 } = req.query as PaginationQueryParameters;
    const { search } = req.query as { search?: string };

    const dataSource = await getAppDataSource();

    // the "simple" case without search
    if (!search) {
      const result = await dataSource.manager.findAndCount(Client, {
        skip,
        take,
        order: { id: "ASC" },
      });
      res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Client>);
      return;
    }

    const baseQuery = dataSource.manager
      .createQueryBuilder(Client, "client")
      .where(
        "first_name || ' ' || last_name LIKE '%' || :nameSearch || '%' " +
          "OR company_name LIKE '%' || :nameSearch || '%'",
        {
          nameSearch: search,
          companySearch: search,
        },
      );

    const result = await Promise.all([
      baseQuery.take(take).skip(skip).getMany(),
      baseQuery.getCount(),
    ]);
    res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Client>);
  },
);

clientsRouter.post(
  "/",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();
    try {
      const maxId = await dataSource.manager.query(
        "SELECT max(cast(substr(id,2) as integer)) as max_id from client",
      );
      const client = dataSource.manager.create(Client, {
        ...req.body,
        id: `K${maxId[0].max_id + 1}`,
      });
      const results = await dataSource.manager.save(Client, client);
      res.json(results);
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.delete(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();
    try {
      res.json(await dataSource.manager.delete(Client, { id: req.params.id }));
    } catch (error) {
      if (error.code !== SQLITE_CONSTRAINT_ERROR_CODE) {
        next(error);
        return;
      }
      const ordersCount = await dataSource.manager.countBy(Order, {
        client_id: req.params.id,
      });
      if (ordersCount > 0) {
        next(new ApiError(ErrorCode.FK_CONSTRAINT_ORDER));
      }

      next(error);
    }
  },
);

clientsRouter.patch(
  "/:id",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();
    const client = await dataSource.manager.findOneBy(Client, {
      id: req.params.id,
    });
    if (!client) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    for (const [key, value] of Object.entries(req.body)) {
      (client as any)[key] = value; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    try {
      res.json(await dataSource.manager.save(Client, client));
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.get(
  "/:id",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource();
    const client = await dataSource.manager.findOneBy(Client, {
      id: req.params.id,
    });
    if (!client) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    } else res.json(client);
  },
);
