import express from 'express'

import { getAppDataSource } from '@/db'
import { Article } from '@/db/entities/article'
import { ErrorCode, UserRole } from '@/global/types/backendTypes'
import { ApiError } from '@/helpers/apiErrors'
import { noCache } from '@/helpers/middleware'
import { checkAuth } from '@/helpers/roleManagement'

export const articlesRouter = express.Router()
articlesRouter.use(noCache)

articlesRouter.get(
  '',
  [checkAuth({ all: true })],
  async (_: express.Request, res: express.Response) => {
    const dataSource = await getAppDataSource()
    res.json(await dataSource.manager.find(Article))
  },
)

articlesRouter.patch(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const article = await dataSource.manager.findOneBy(Article, {
      id: req.params.id,
    })
    if (!article) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
      return
    }

    for (const [key, value] of Object.entries(req.body)) {
      ;(article as any)[key] = value // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    try {
      res.json(await dataSource.manager.save(Article, article))
    } catch (error) {
      next(error)
    }
  },
)

articlesRouter.post(
  '/',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    try {
      const maxId = (
        await dataSource.manager.query(
          'SELECT max(cast(substr(id,4) as integer)) as max_id from article',
        )
      )[0].max_id

      const article = await dataSource.manager.create(Article, {
        ...req.body,
        id: `Art${maxId + 1}`,
      })
      const results = await dataSource.manager.save(Article, article)
      res.json(results)
    } catch (error) {
      next(error)
    }
  },
)

articlesRouter.delete(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    try {
      res.json(await dataSource.manager.delete(Article, { id: req.params.id }))
    } catch (error) {
      next(error)
    }
  },
)
