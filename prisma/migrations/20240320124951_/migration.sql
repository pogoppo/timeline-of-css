/*
  Warnings:

  - The primary key for the `css` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_css" (
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parent" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "version" REAL NOT NULL,
    "link" TEXT,
    "description" TEXT,

    PRIMARY KEY ("name", "category", "parent", "browser")
);
INSERT INTO "new_css" ("browser", "category", "description", "link", "name", "parent", "version") SELECT "browser", "category", "description", "link", "name", "parent", "version" FROM "css";
DROP TABLE "css";
ALTER TABLE "new_css" RENAME TO "css";
CREATE INDEX "css_browser_version_idx" ON "css"("browser", "version");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
