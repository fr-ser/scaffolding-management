import express from 'express'

import { getAppDataSource } from '@/db'
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from '@/db/entities/documents'
import { DocumentKind } from '@/global/types/appTypes'
import { GetDocumentsResponse } from '@/global/types/backendTypes'
import { noCache } from '@/helpers/middleware'
import { checkAuth } from '@/helpers/roleManagement'

export const documentsRouter = express.Router()
documentsRouter.use(noCache)

documentsRouter.get(
  '',
  [checkAuth({ all: true })],
  async (_: express.Request, res: express.Response) => {
    const dataSource = await getAppDataSource()
    const allDataResult = await Promise.all([
      dataSource.manager.find(InvoiceDocument),
      dataSource.manager.findBy(OfferDocument, {}),
      dataSource.manager.findBy(OverdueNoticeDocument, {}),
    ])

    res.json({
      [DocumentKind.invoice]: allDataResult[0],
      [DocumentKind.offer]: allDataResult[1],
      [DocumentKind.overdueNotice]: allDataResult[2],
    } as GetDocumentsResponse)
  },
)
