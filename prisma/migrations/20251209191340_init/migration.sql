/*
  Warnings:

  - Added the required column `elyBy` to the `Launcher` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Launcher" (
    "path" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "javaPath" TEXT,
    "elyBy" BOOLEAN NOT NULL
);
INSERT INTO "new_Launcher" ("height", "id", "javaPath", "max", "min", "path", "width") SELECT "height", "id", "javaPath", "max", "min", "path", "width" FROM "Launcher";
DROP TABLE "Launcher";
ALTER TABLE "new_Launcher" RENAME TO "Launcher";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
