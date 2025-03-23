import express from "express";

import { checkPermissionMiddleware } from "@/authorization";
import { getAppDataSource } from "@/db";
import { OfferDocumentItem } from "@/db/entities/document_items";
import { OfferDocument } from "@/db/entities/documents";
import { Offer } from "@/db/entities/offer";
import { OfferItem } from "@/db/entities/order_items";
import { ErrorCode, UserPermissions } from "@/global/types/backendTypes";
import { OfferCreate, OfferUpdate } from "@/global/types/dataEditTypes";
import { ApiError } from "@/helpers/apiErrors";

export const offersRouter = express.Router();

offersRouter.get(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_VIEW)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const offer = await dataSource.manager.findOne(Offer, {
      where: { id: parseInt(req.params.id) },
    });

    if (!offer) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(offer);
  },
);

offersRouter.post(
  "",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const payload = req.body as OfferCreate;

    const offer = dataSource.manager.create(Offer, { ...payload });

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(Offer, offer);

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(OfferItem)
          .values(
            payload.items.map((item) => {
              return {
                kind: item.kind,
                title: item.title,
                description: item.description,
                unit: item.unit,
                price: item.price,
                amount: item.amount,
                offer_id: offer.id,
              };
            }),
          )
          .execute();
      });

      res.json(offer);
    } catch (error) {
      next(error);
      return;
    }
  },
);

offersRouter.patch(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const offerId = parseInt(req.params.id);
    const payload = req.body as OfferUpdate;
    const dataSource = getAppDataSource();

    const payloadWithoutItems = { ...payload, items: undefined, id: offerId };

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(Offer, payloadWithoutItems);

        if (payload.items == null) return;

        await transactionalEntityManager.delete(OfferItem, {
          offer_id: payloadWithoutItems.id,
        });

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(OfferItem)
          .values(
            payload.items.map((item) => {
              return {
                kind: item.kind,
                title: item.title,
                description: item.description,
                unit: item.unit,
                price: item.price,
                amount: item.amount,
                offer_id: offerId,
              };
            }),
          )
          .execute();
      });
    } catch (error) {
      next(error);
      return;
    }

    const offer = await dataSource.manager.findOne(Offer, {
      where: { id: parseInt(req.params.id) },
    });

    if (offer == null) next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
    else res.json(offer);
  },
);

offersRouter.delete(
  "/:id",
  [checkPermissionMiddleware(UserPermissions.SUB_ORDERS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();

    const documentCount = await dataSource.manager.countBy(OfferDocument, {
      offer_id: parseInt(req.params.id),
    });
    if (documentCount > 0) {
      next(new ApiError(ErrorCode.FK_CONSTRAINT_DOCUMENT));
      return;
    }

    try {
      res.json(await dataSource.manager.delete(Offer, { id: req.params.id }));
    } catch (error) {
      next(error);
    }
  },
);

offersRouter.get(
  "/:id/documents",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_VIEW)],
  async (req: express.Request, res: express.Response) => {
    const dataSource = getAppDataSource();
    res.json(
      await dataSource.manager.find(OfferDocument, {
        where: { offer_id: parseInt(req.params.id) },
      }),
    );
  },
);

offersRouter.post(
  "/:id/documents",
  [checkPermissionMiddleware(UserPermissions.DOCUMENTS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const dataSource = getAppDataSource();
    const offer = await dataSource.manager.findOne(Offer, {
      where: { id: parseInt(req.params.id) },
      relations: { order: { client: true }, items: true },
    });
    if (!offer) {
      next(new ApiError(ErrorCode.ENTITY_NOT_FOUND));
      return;
    }

    const maxId = (
      await dataSource.manager.query(`
      SELECT max(cast(substr(id,11) as integer)) as max_id
      from offer_document
      where id LIKE 'A-${offer.offered_at.substring(0, 7)}-%'
    `)
    )[0].max_id;

    try {
      const document = dataSource.manager.create(OfferDocument, {
        id: `A-${offer.offered_at.substring(0, 7)}-${maxId + 1}`,
        order_id: offer.order_id,
        creation_date: new Date().toISOString().substring(0, 10),
        client_id: offer.order.client_id,
        client_email: offer.order.client.email,
        client_company_name: offer.order.client.company_name,
        client_first_name: offer.order.client.first_name,
        client_last_name: offer.order.client.last_name,
        client_street_and_number: offer.order.client.street_and_number,
        client_postal_code: offer.order.client.postal_code,
        client_city: offer.order.client.city,
        order_title: offer.order.title,
        offer_id: offer.id,
        offered_at: offer.offered_at,
        offer_valid_until: offer.offer_valid_until,
      });

      await dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(OfferDocument, document);

        await transactionalEntityManager
          .createQueryBuilder()
          .insert()
          .into(OfferDocumentItem)
          .values(
            offer.items.map((item) => {
              return {
                offer_document_id: document.id,
                kind: item.kind,
                title: item.title,
                description: item.description,
                unit: item.unit,
                price: item.price,
                amount: item.amount,
              };
            }),
          )
          .execute();
      });

      res.json(document);
    } catch (error) {
      next(error);
      return;
    }
  },
);
