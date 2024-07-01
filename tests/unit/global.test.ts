import fs from "fs";
import { glob } from "glob";
import { expect, test } from "vitest";

test("global scripts are the same", async () => {
  const backendFiles = await glob("backend/src/global/**/*");
  const frontendFiles = await glob("frontend/src/global/**/*");

  expect(backendFiles).toHaveLength(frontendFiles.length);

  for (const backendFile of backendFiles) {
    if (fs.lstatSync(backendFile).isDirectory()) continue;

    if (
      !fs
        .readFileSync(backendFile)
        .equals(fs.readFileSync(backendFile.replace("backend", "frontend")))
    ) {
      expect.fail(`Files are not the same: ${backendFile}`);
    }
  }
});
