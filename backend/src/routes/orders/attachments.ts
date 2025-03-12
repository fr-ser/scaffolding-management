import fs from "node:fs/promises";

import express from "express";
import formidable from "formidable";

import { DropboxFile, ErrorCode, UserRole } from "@/global/types/backendTypes";
import { ApiError } from "@/helpers/apiErrors";
import { log } from "@/helpers/logging";
import { checkAuth } from "@/helpers/roleManagement";
import { deleteFile, getFileDownloadLink, getFilesForOrder, uploadFile } from "@/services/dropbox";

export const attachmentsRouter = express.Router({ mergeParams: true });

attachmentsRouter.get(
  "/",
  [checkAuth({ all: true })],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let files: string[];
    try {
      files = await getFilesForOrder(req.params.orderId);
    } catch (error) {
      log("Error getting files from dropbox", error);
      next(error);
      return;
    }

    const getLinkPromises = await Promise.all(
      files.map((fileName) => getFileDownloadLink(req.params.orderId, fileName)),
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
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
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
      await uploadFile(req.params.orderId, file);
    } catch (error) {
      log("Error uploading file", error);
      next(error);
    } finally {
      await fs.unlink(file.filepath);
    }

    res.send({
      name: file.originalFilename as string,
      link: await getFileDownloadLink(req.params.orderId, file.originalFilename as string),
    } as DropboxFile);
  },
);

attachmentsRouter.delete(
  "/:fileName",
  [checkAuth({ yes: [UserRole.admin, UserRole.partner] })],
  async (req: express.Request, res: express.Response) => {
    await deleteFile(req.params.orderId, req.params.fileName);
    res.sendStatus(200);
  },
);
