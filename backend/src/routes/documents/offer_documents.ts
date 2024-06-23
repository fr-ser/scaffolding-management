import express from 'express'

import { getAppDataSource } from '@/db'
import { OfferDocument } from '@/db/entities/documents'
import { ErrorCode, UserRole } from '@/global/types/backendTypes'
import { ApiError } from '@/helpers/apiErrors'
import { noCache } from '@/helpers/middleware'
import { checkAuth } from '@/helpers/roleManagement'

export const offerDocumentsRouter = express.Router()
offerDocumentsRouter.use(noCache)

offerDocumentsRouter.get(
  '/:id',
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const document = await dataSource.manager.findOne(OfferDocument, {
      relations: { items: true },
      where: { id: req.params.id },
    })

    if (!document) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
    else res.json(document)
  },
)

offerDocumentsRouter.delete(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    try {
      res.json(await dataSource.manager.delete(OfferDocument, { id: req.params.id }))
    } catch (error) {
      next(error)
    }
  },
)
