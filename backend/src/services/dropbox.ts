import fs from "node:fs/promises";

import { Dropbox } from "dropbox";
import formidable from "formidable";

import { DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET, DROPBOX_REFRESH_TOKEN } from "@/config";

const dbx = new Dropbox({
  clientId: DROPBOX_CLIENT_ID,
  clientSecret: DROPBOX_CLIENT_SECRET,
  refreshToken: DROPBOX_REFRESH_TOKEN,
});

export async function getFilesInFolder(folderPath: string) {
  // TODO: handle pagination
  try {
    const contents = (await dbx.filesListFolder({ path: folderPath })).result.entries;

    return contents.filter((entry) => entry[".tag"] === "file").map((entry) => entry.name);
  } catch (err) {
    if (err?.error?.error?.path?.[".tag"] === "not_found") return [];
    throw err;
  }
}

export async function uploadFile(path: string, file: formidable.File) {
  const contents = await fs.readFile(file.filepath);

  await dbx.filesUpload({ contents, path });
}

export async function deleteFile(path: string) {
  await dbx.filesDeleteV2({ path });
}

export async function getFileDownloadLink(path: string) {
  const result = await dbx.filesGetTemporaryLink({ path });
  return result.result.link;
}
