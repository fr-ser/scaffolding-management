import { DB_PATH, DROPBOX_PATH_PREFIX } from "@/config";
import { log } from "@/helpers/logging";
import { deleteFile, getFilesInFolder, uploadFile } from "@/services/dropbox";

export async function backupDatabase() {
  const today = new Date();

  await uploadFile(
    `${DROPBOX_PATH_PREFIX}/backup/database/${today.toISOString().split("T")[0]}.db`,
    DB_PATH,
  );

  log(`Uploaded database for ${today.toISOString().split("T")[0]}`);

  const existingBackups = await getFilesInFolder(`${DROPBOX_PATH_PREFIX}/backup/database/`);

  const fileDates = existingBackups.map((file) => ({
    filename: file,
    date: new Date(file.replace(".db", "")),
  }));

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const keep = new Set<string>(); // Store filenames to keep
  const latestPerMonth = new Map<string, string>(); // Format: YYYY-MM -> latest filename
  const latestPerYear = new Map<string, string>(); // Format: YYYY -> latest filename

  // by sorting the dates we can fill up the "latest per month/year" by taking the first element
  fileDates.sort((a, b) => b.date.getTime() - a.date.getTime());
  for (const file of fileDates) {
    const fileYear = String(file.date.getFullYear());
    const fileMonth = `${fileYear}-${String(file.date.getMonth() + 1).padStart(2, "0")}`;

    if (file.date >= sevenDaysAgo) {
      // Keep last 7 days of files
      keep.add(file.filename);
    } else if (fileYear === String(now.getFullYear())) {
      // Keep the latest file per month for the current year
      if (!latestPerMonth.has(fileMonth)) {
        latestPerMonth.set(fileMonth, file.filename);
        keep.add(file.filename);
      }
    } else {
      // Keep the latest file per year for previous years
      if (!latestPerYear.has(fileYear)) {
        latestPerYear.set(fileYear, file.filename);
        keep.add(file.filename);
      }
    }
  }

  log(`Found ${fileDates.length} backup files. Keeping ${keep.size}.`);

  for (const file of fileDates) {
    if (!keep.has(file.filename)) {
      await deleteFile(`${DROPBOX_PATH_PREFIX}/backup/database/${file.filename}`);
      log(`Deleted: ${file.filename}`);
    }
  }

  log("Finished database backup");
}
