import express from 'express'

import { getAppDataSource } from '@/db'
import { Client } from '@/db/entities/client'
import { Order } from '@/db/entities/order'
import { ErrorCode, UserRole } from '@/global/types/backendTypes'
import { ApiError, SQLITE_CONSTRAINT_ERROR_CODE } from '@/helpers/apiErrors'
import { noCache } from '@/helpers/middleware'
import { checkAuth } from '@/helpers/roleManagement'

export const clientsRouter = express.Router()
clientsRouter.use(noCache)

clientsRouter.get(
  '/',
  [checkAuth({ all: true })],
  async (_: express.Request, res: express.Response) => {
    const dataSource = await getAppDataSource()
    res.json(await dataSource.manager.find(Client))
  },
)

clientsRouter.post(
  '/',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    try {
      const maxId = await dataSource.manager.query(
        'SELECT max(cast(substr(id,2) as integer)) as max_id from client',
      )
      const client = await dataSource.manager.create(Client, {
        ...req.body,
        id: `K${maxId[0].max_id + 1}`,
      })
      const results = await dataSource.manager.save(Client, client)
      res.json(results)
    } catch (error) {
      next(error)
    }
  },
)

clientsRouter.delete(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    try {
      res.json(await dataSource.manager.delete(Client, { id: req.params.id }))
    } catch (error) {
      if (error.code !== SQLITE_CONSTRAINT_ERROR_CODE) {
        next(error)
        return
      }
      const ordersCount = await dataSource.manager.countBy(Order, {
        client_id: req.params.id,
      })
      if (ordersCount > 0) {
        next(new ApiError(ErrorCode.FK_CONSTRAINT_ORDER))
      }

      next(error)
    }
  },
)

clientsRouter.patch(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const client = await dataSource.manager.findOneBy(Client, {
      id: req.params.id,
    })
    if (!client) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
      return
    }

    for (const [key, value] of Object.entries(req.body)) {
      ;(client as any)[key] = value // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    try {
      res.json(await dataSource.manager.save(Client, client))
    } catch (error) {
      next(error)
    }
  },
)

clientsRouter.get(
  '/:id',
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const client = await dataSource.manager.findOneBy(Client, {
      id: req.params.id,
    })
    if (!client) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
    } else res.json(client)
  },
)
