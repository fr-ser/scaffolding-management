import fs from "node:fs/promises";

import { Dropbox, files } from "dropbox";

import { DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET, DROPBOX_REFRESH_TOKEN } from "@/config";

const dbx = new Dropbox({
  clientId: DROPBOX_CLIENT_ID,
  clientSecret: DROPBOX_CLIENT_SECRET,
  refreshToken: DROPBOX_REFRESH_TOKEN,
});

export async function getFilesInFolder(folderPath: string) {
  let entries: string[] = [];
  let hasMore = false;
  try {
    const result = (await dbx.filesListFolder({ path: folderPath })).result;
    entries = entries.concat(
      result.entries.filter((entry) => entry[".tag"] === "file").map((entry) => entry.name),
    );
    hasMore = result.has_more;
    let cursor = result.cursor;
    while (hasMore) {
      const cursorResult = (await dbx.filesListFolderContinue({ cursor })).result;
      entries = entries.concat(
        cursorResult.entries.filter((entry) => entry[".tag"] === "file").map((entry) => entry.name),
      );
      hasMore = cursorResult.has_more;
      cursor = cursorResult.cursor;
    }
  } catch (err) {
    if (err?.error?.error?.path?.[".tag"] === "not_found") return [];
    throw err;
  }

  return entries;
}

export async function uploadFile(
  path: string,
  filePath: string,
  options?: { overwrite?: boolean },
) {
  const uploadOptions: files.UploadArg = {
    contents: await fs.readFile(filePath),
    path,
  };

  // Set the mode based on options
  if (options?.overwrite) {
    uploadOptions.mode = { ".tag": "overwrite" };
  } else {
    uploadOptions.mode = { ".tag": "add" }; // Default mode that fails if file exists
  }

  await dbx.filesUpload(uploadOptions);
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
