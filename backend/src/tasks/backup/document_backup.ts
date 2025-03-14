import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DataSource, MoreThanOrEqual } from "typeorm";

import { DROPBOX_PATH_PREFIX } from "@/config";
import { InvoiceDocument, OfferDocument, OverdueNoticeDocument } from "@/db/entities/documents";
import { DocumentKind } from "@/global/types/appTypes";
import { AnyDocument } from "@/global/types/backendTypes";
import { log } from "@/helpers/logging";
import { renderMultiplePDF } from "@/pdf/renderPDF";
import { getFilesInFolder, renameFile, uploadFile } from "@/services/dropbox";

export async function backupDocuments(dataSource: DataSource) {
  let documentBackupLastTime = "1970-01-01";
  const metaFiles = await getFilesInFolder(`${DROPBOX_PATH_PREFIX}/backup/documents/meta/`);
  if (metaFiles.length === 0) {
    log("Warning: No previous document backup start date found");
  } else {
    documentBackupLastTime = metaFiles[0];
  }
  const allDocuments = (
    (await Promise.all([
      dataSource.manager
        .find(InvoiceDocument, {
          where: { created_at: MoreThanOrEqual(new Date(documentBackupLastTime).getTime()) },
          relations: { items: true },
        })
        .then((result) =>
          result.map((item) => {
            return { kind: DocumentKind.invoice, document: item };
          }),
        ),
      dataSource.manager
        .find(OfferDocument, {
          where: { created_at: MoreThanOrEqual(new Date(documentBackupLastTime).getTime()) },
          relations: { items: true },
        })
        .then((result) =>
          result.map((item) => {
            return { kind: DocumentKind.offer, document: item };
          }),
        ),
      dataSource.manager
        .find(OverdueNoticeDocument, {
          where: { created_at: MoreThanOrEqual(new Date(documentBackupLastTime).getTime()) },
          relations: { invoice_documents: { items: true } },
        })
        .then((result) =>
          result.map((item) => {
            return { kind: DocumentKind.overdueNotice, document: item };
          }),
        ),
    ])) as AnyDocument[][]
  ).flatMap((item) => item);

  log(`Found ${allDocuments.length} to back up`);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, "0");

  const temporaryFolder = await fs.mkdtemp(join(tmpdir(), "backup-"));
  const temporaryPdfPath = temporaryFolder + "/temp.pdf";
  for (const document of allDocuments) {
    await fs.writeFile(temporaryPdfPath, await renderMultiplePDF([document]));
    await uploadFile(
      `${DROPBOX_PATH_PREFIX}/backup/documents/${yesterdayYear}/${yesterdayMonth}/${document.document.id}`,
      temporaryPdfPath,
    );
    log(`Uploaded ${document.document.id}`);
  }
  log(`All documents are backed up`);

  if (metaFiles.length === 0) {
    const tempFilePath = temporaryFolder + "/empty";
    await fs.writeFile(tempFilePath, "");
    await uploadFile(
      `${DROPBOX_PATH_PREFIX}/backup/documents/meta/${yesterday.toISOString().split("T")[0]}`,
      tempFilePath,
    );
  } else if (documentBackupLastTime !== yesterday.toISOString().split("T")[0]) {
    await renameFile(
      `${DROPBOX_PATH_PREFIX}/backup/documents/meta/${documentBackupLastTime}`,
      `${DROPBOX_PATH_PREFIX}/backup/documents/meta/${yesterday.toISOString().split("T")[0]}`,
    );
  }

  log(`Stored new meta information`);

  await fs.rm(temporaryFolder, { recursive: true, force: true });

  log("Finished document backup");
}
