import fs from "node:fs/promises";

import express from "express";
import formidable from "formidable";

import { checkPermissionMiddleware } from "@/authorization";
import { DROPBOX_PATH_PREFIX } from "@/config";
import { DropboxFile, ErrorCode, UserPermissions } from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";
import { log } from "@/helpers/logging";
import { deleteFile, getFileDownloadLink, getFilesInFolder, uploadFile } from "@/services/dropbox";

export const attachmentsRouter = express.Router({ mergeParams: true });

attachmentsRouter.get(
  "/",
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let files: string[];
    try {
      files = await getFilesInFolder(`${DROPBOX_PATH_PREFIX}/attachments/${req.params.orderId}/`);
    } catch (error) {
      log("Error getting files from dropbox", error);
      next(error);
      return;
    }

    const getLinkPromises = await Promise.all(
      files.map((fileName) =>
        getFileDownloadLink(`${DROPBOX_PATH_PREFIX}/attachments/${req.params.orderId}/${fileName}`),
      ),
    );

    res.send(
      getLinkPromises.map((link, index) => {
        return { name: files[index], link };
      }),
    );
  },
);

attachmentsRouter.post(
  "/",
  [checkPermissionMiddleware(UserPermissions.ATTACHMENTS_EDIT)],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const form = formidable({ maxFiles: 1 });

    let file: formidable.File;
    try {
      const [_, files] = await form.parse(req);
      if (files.file == null) {
        log(`File not found in body: ${JSON.stringify(files)}`);
        next(new ApiError(ErrorCode.INTERNAL));
        return;
      }
      file = files.file[0];
    } catch (error) {
      log("Error getting the files from the request", error);
      next(error);
      return;
    }

    try {
      await uploadFile(
        `${DROPBOX_PATH_PREFIX}/attachments/${req.params.orderId}/${file.originalFilename}`,
        file,
      );
    } catch (error) {
      log("Error uploading file", error);
      next(error);
    } finally {
      await fs.unlink(file.filepath);
    }

    res.send({
      name: file.originalFilename as string,
      link: await getFileDownloadLink(
        `${DROPBOX_PATH_PREFIX}/attachments/${req.params.orderId}/${file.originalFilename as string}`,
      ),
    } as DropboxFile);
  },
);

attachmentsRouter.delete(
  "/:fileName",
  [checkPermissionMiddleware(UserPermissions.ATTACHMENTS_EDIT)],
  async (req: express.Request, res: express.Response) => {
    await deleteFile(
      `${DROPBOX_PATH_PREFIX}/attachments/${req.params.orderId}/${req.params.fileName}`,
    );
    res.sendStatus(200);
  },
);
