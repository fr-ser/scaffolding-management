import fs from "node:fs/promises";

import { Dropbox } from "dropbox";
import formidable from "formidable";

import {
  DROPBOX_CLIENT_ID,
  DROPBOX_CLIENT_SECRET,
  DROPBOX_PATH_PREFIX,
  DROPBOX_REFRESH_TOKEN,
} from "@/config";

const dbx = new Dropbox({
  clientId: DROPBOX_CLIENT_ID,
  clientSecret: DROPBOX_CLIENT_SECRET,
  refreshToken: DROPBOX_REFRESH_TOKEN,
});

export async function getFilesForOrder(orderId: string) {
  try {
    const contents = (
      await dbx.filesListFolder({
        path: DROPBOX_PATH_PREFIX + orderId + "/",
      })
    ).result.entries;

    return contents.filter((entry) => entry[".tag"] === "file").map((entry) => entry.name);
  } catch (err) {
    if (err?.error?.error?.path?.[".tag"] === "not_found") return [];
    throw err;
  }
}

export async function uploadFile(orderId: string, file: formidable.File) {
  const path = DROPBOX_PATH_PREFIX + orderId + "/" + file.originalFilename;
  const contents = await fs.readFile(file.filepath);

  await dbx.filesUpload({ contents, path });
}

export async function deleteFile(orderId: string, fileName: string) {
  const path = DROPBOX_PATH_PREFIX + orderId + "/" + fileName;

  await dbx.filesDeleteV2({ path });
}

export async function getFileDownloadLink(orderId: string, fileName: string) {
  const path = DROPBOX_PATH_PREFIX + orderId + "/" + fileName;
  const result = await dbx.filesGetTemporaryLink({ path });
  return result.result.link;
}
