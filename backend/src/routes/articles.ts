import express from "express";
import { FindOneOptions, ILike } from "typeorm";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { Article } from "@/db/entities/article";
import {
  ErrorCode,
  PaginationQueryParameters,
  PaginationResponse,
  UserPermissions,
} from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";

export const articlesRouter = express.Router();

articlesRouter.get(
  "",
  [checkPermissionMiddleware(UserPermissions.ARTICLES_VIEW)],
  async (req: express.Request, res: express.Response) => {
    const { skip = 0, take = 100 } = req.query as PaginationQueryParameters;
    const { search } = req.query as { search?: string };
    const dataSource = getAppDataSource();

    let whereClause: FindOneOptions<Article>["where"] = undefined;

    if (search) {
      whereClause = [
        { id: ILike(`%${search}%`) },
        { title: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
      ];
    }

    const result = await dataSource.manager.findAndCount(Article, {
      skip,
      take,
      order: { created_at: "DESC" },
      where: whereClause,
    });

    res.json({ data: result[0], totalCount: result[1] } as PaginationResponse<Article>);
  },
);

articlesRouter.patch(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.ARTICLES_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    let article: Article | null = null;

    try {
      await dataSource.manager.update(Article, req.params.id, req.body);
      article = await dataSource.manager.findOneBy(Article, {
        id: req.params.id,
      });
    } catch (error) {
      next(error);
      return;
    }

    if (article != null) res.json(article);
    else next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
  },
);

articlesRouter.post(
  "/",
  [checkPermissionMiddleware(UserPermissions.ARTICLES_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      const maxId =
        (
          await dataSource.manager.query(
            "SELECT max(cast(substr(id,4) as integer)) as max_id from article",
          )
        )[0].max_id || 0;

      const article = dataSource.manager.create(Article, {
        ...req.body,
        id: `Art${maxId + 1}`,
      });
      const results = await dataSource.manager.save(Article, article);
      res.json(results);
    } catch (error) {
      next(error);
    }
  },
);

articlesRouter.delete(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.ARTICLES_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    try {
      res.json(await dataSource.manager.delete(Article, { id: req.params.id }));
    } catch (error) {
      next(error);
    }
  },
);
