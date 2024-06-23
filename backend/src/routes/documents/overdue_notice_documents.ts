import express from 'express'

import { getAppDataSource } from '@/db'
import { OverdueNoticeDocument } from '@/db/entities/documents'
import { ErrorCode, UserRole } from '@/global/types/backendTypes'
import { ApiError } from '@/helpers/apiErrors'
import { noCache } from '@/helpers/middleware'
import { checkAuth } from '@/helpers/roleManagement'

export const overdueNoticeDocumentsRouter = express.Router()
overdueNoticeDocumentsRouter.use(noCache)

overdueNoticeDocumentsRouter.get(
  '/:id',
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const document = await dataSource.manager.findOne(OverdueNoticeDocument, {
      relations: { invoice_documents: { items: true } },
      where: { id: req.params.id },
    })

    if (!document) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
    else res.json(document)
  },
)

overdueNoticeDocumentsRouter.delete(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    try {
      res.json(
        await dataSource.manager.delete(OverdueNoticeDocument, {
          id: req.params.id,
        }),
      )
    } catch (error) {
      next(error)
    }
  },
)
