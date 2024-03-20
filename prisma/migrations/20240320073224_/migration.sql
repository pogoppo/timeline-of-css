/*
  Warnings:

  - The primary key for the `css` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `note` on the `css` table. All the data in the column will be lost.
  - Added the required column `parent` to the `css` table without a default value. This is not possible if the table is not empty.

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

    PRIMARY KEY ("name", "category", "parent", "browser", "version")
);
INSERT INTO "new_css" ("browser", "category", "link", "name", "version") SELECT "browser", "category", "link", "name", "version" FROM "css";
DROP TABLE "css";
ALTER TABLE "new_css" RENAME TO "css";
CREATE INDEX "css_browser_version_idx" ON "css"("browser", "version");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
