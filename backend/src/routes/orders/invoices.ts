import express from 'express'

import { getAppDataSource } from '@/db'
import { InvoiceDocumentItem } from '@/db/entities/document_items'
import { InvoiceDocument } from '@/db/entities/documents'
import { Invoice } from '@/db/entities/invoice'
import { ErrorCode, UserRole } from '@/global/types/backendTypes'
import { ApiError } from '@/helpers/apiErrors'
import { noCache } from '@/helpers/middleware'
import { checkAuth } from '@/helpers/roleManagement'

export const invoicesRouter = express.Router()
invoicesRouter.use(noCache)
// TODO: check here and everywhere in the backend that the user permissions are respected

invoicesRouter.get(
  '/:id',
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const invoice = await dataSource.manager.findOne(Invoice, {
      where: { id: parseInt(req.params.id) },
    })

    if (!invoice) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
    else res.json(invoice)
  },
)

invoicesRouter.delete(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()

    const documentCount = await dataSource.manager.countBy(InvoiceDocument, {
      invoice_id: req.params.id,
    })
    if (documentCount > 0) {
      next(new ApiError(ErrorCode.FK_CONSTRAINT_DOCUMENT))
      return
    }

    try {
      res.json(await dataSource.manager.delete(Invoice, { id: req.params.id }))
    } catch (error) {
      next(error)
    }
  },
)

invoicesRouter.patch(
  '/:id',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const invoice = await dataSource.manager.findOne(Invoice, {
      where: { id: parseInt(req.params.id) },
    })
    if (!invoice) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
      return
    }

    for (const [key, value] of Object.entries(req.body)) {
      ;(invoice as any)[key] = value // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    try {
      res.json(await dataSource.manager.save(Invoice, invoice))
    } catch (error) {
      next(error)
    }
  },
)

invoicesRouter.get(
  '/:id/documents',
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response) => {
    const dataSource = await getAppDataSource()
    const documents = await dataSource.manager.find(InvoiceDocument, {
      where: { invoice_id: req.params.id },
    })
    res.json(documents)
  },
)

invoicesRouter.post(
  '/:id/documents/create',
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = await getAppDataSource()
    const invoice = await dataSource.manager.findOne(Invoice, {
      where: { id: parseInt(req.params.id) },
      relations: { order: { client: true }, items: true },
    })
    if (!invoice) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND))
      return
    }

    const maxId = (
      await dataSource.manager.query(`
      SELECT max(cast(substr(id,11) as integer)) as max_id
      from invoice_document
      where id LIKE 'R-${invoice.invoice_date.substring(0, 7)}-%'
    `)
    )[0].max_id

    const document = dataSource.manager.create(InvoiceDocument, {
      id: `R-${invoice.invoice_date.substring(0, 7)}-${maxId + 1}`,
      creation_date: new Date().toISOString().substring(0, 10),
      client_id: invoice.order.client_id,
      client_email: invoice.order.client.email,
      client_company_name: invoice.order.client.company_name,
      client_first_name: invoice.order.client.first_name,
      client_last_name: invoice.order.client.last_name,
      client_street_and_number: invoice.order.client.street_and_number,
      client_postal_code: invoice.order.client.postal_code,
      client_city: invoice.order.client.city,
      order_title: invoice.order.title,
      invoice_id: String(invoice.id),
      service_dates: invoice.service_dates,
      payment_target: invoice.payment_target,
      can_have_cash_discount: invoice.order.can_have_cash_discount,
      discount_duration: invoice.order.discount_duration,
      discount_percentage: invoice.order.discount_percentage,
    })

    await dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(InvoiceDocument, document)

      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(InvoiceDocumentItem)
        .values(
          invoice.items.map((item) => {
            return {
              invoice_document_id: document.id,
              kind: item.kind,
              title: item.title,
              description: item.description,
              unit: item.unit,
              price: item.price,
              amount: item.amount,
            }
          }),
        )
        .execute()
    })

    res.json(document)
  },
)
