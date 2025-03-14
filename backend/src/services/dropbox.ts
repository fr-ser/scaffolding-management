import fs from "node:fs/promises";

import { Dropbox } from "dropbox";

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

export async function uploadFile(path: string, filePath: string) {
  await dbx.filesUpload({ contents: await fs.readFile(filePath), path });
}

export async function renameFile(fromPath: string, toPath: string) {
  await dbx.filesMoveV2({ from_path: fromPath, to_path: toPath });
}

export async function deleteFile(path: string) {
  await dbx.filesDeleteV2({ path });
}

export async function getFileDownloadLink(path: string) {
  const result = await dbx.filesGetTemporaryLink({ path });
  return result.result.link;
}
