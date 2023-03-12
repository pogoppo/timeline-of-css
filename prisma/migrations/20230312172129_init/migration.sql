-- CreateTable
CREATE TABLE "css" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "version" REAL NOT NULL,
    "link" TEXT,
    "note" TEXT
);

-- CreateTable
CREATE TABLE "versions" (
    "browser" TEXT NOT NULL,
    "version" REAL NOT NULL,
    "release_date" DATETIME NOT NULL,

    PRIMARY KEY ("browser", "version")
);

-- CreateIndex
CREATE INDEX "css_browser_version_idx" ON "css"("browser", "version");
