// Usage:
// CONFIG_PATH=../.env.development npx ts-node --require tsconfig-paths/register scripts/download-database-backup.ts list
// CONFIG_PATH=../.env.development npx ts-node --require tsconfig-paths/register scripts/download-database-backup.ts YYYY-MM-DD [target-file]
import fs from "node:fs/promises";

import { Dropbox } from "dropbox";

import {
  DROPBOX_CLIENT_ID,
  DROPBOX_CLIENT_SECRET,
  DROPBOX_PATH_PREFIX,
  DROPBOX_REFRESH_TOKEN,
} from "@/config";

type FileDownloadResult = {
  fileBinary?: Buffer | ArrayBuffer | Uint8Array | string;
};

type DropboxError = {
  status?: number;
  error?: {
    error_summary?: string;
  };
};

type DropboxEntry = {
  ".tag": string;
  name: string;
};

const command = process.argv[2];

if (!command || (command !== "list" && !/^\d{4}-\d{2}-\d{2}$/.test(command))) {
  throw new Error("Usage: download-database-backup.ts list | YYYY-MM-DD [target-file]");
}

const dbx = new Dropbox({
  clientId: DROPBOX_CLIENT_ID,
  clientSecret: DROPBOX_CLIENT_SECRET,
  refreshToken: DROPBOX_REFRESH_TOKEN,
});

async function listAvailableBackups(): Promise<string[]> {
  const folderPath = `${DROPBOX_PATH_PREFIX}/backup/database`;
  const files: string[] = [];

  const result = (await dbx.filesListFolder({ path: folderPath })).result;
  files.push(
    ...(result.entries as DropboxEntry[])
      .filter((entry) => entry[".tag"] === "file")
      .map((entry) => entry.name),
  );

  let hasMore = result.has_more;
  let cursor = result.cursor;
  while (hasMore) {
    const cursorResult = (await dbx.filesListFolderContinue({ cursor })).result;
    files.push(
      ...(cursorResult.entries as DropboxEntry[])
        .filter((entry) => entry[".tag"] === "file")
        .map((entry) => entry.name),
    );
    hasMore = cursorResult.has_more;
    cursor = cursorResult.cursor;
  }

  return files.sort();
}

function isDropboxPathNotFoundError(error: unknown): boolean {
  const dropboxError = error as DropboxError;
  return (
    dropboxError.status === 409 &&
    (dropboxError.error?.error_summary?.startsWith("path/not_found") ?? false)
  );
}

async function main() {
  if (command === "list") {
    const files = await listAvailableBackups();
    console.log(files.join("\n"));
    return;
  }

  const backupDate = command;
  const targetFile = process.argv[3] || `../backup-${backupDate}.db`;
  const dropboxPath = `${DROPBOX_PATH_PREFIX}/backup/database/${backupDate}.db`;
  let response;
  try {
    response = await dbx.filesDownload({ path: dropboxPath });
  } catch (error) {
    if (!isDropboxPathNotFoundError(error)) throw error;

    const files = await listAvailableBackups();
    console.error(`Backup not found: ${dropboxPath}`);
    console.error("Available database backups:");
    console.error(files.join("\n"));
    return;
  }

  const fileBinary = (response.result as FileDownloadResult).fileBinary;

  if (!fileBinary) {
    throw new Error(`No file content returned for ${dropboxPath}`);
  }

  const fileBuffer =
    fileBinary instanceof ArrayBuffer
      ? Buffer.from(fileBinary)
      : Buffer.isBuffer(fileBinary)
        ? fileBinary
        : Buffer.from(fileBinary);

  await fs.writeFile(targetFile, fileBuffer);
  console.log(`Downloaded ${dropboxPath} -> ${targetFile}`);
}

void main();
