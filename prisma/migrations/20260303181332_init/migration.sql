/*
  Warnings:

  - Added the required column `nombre` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id_cliente" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);
INSERT INTO "new_Cliente" ("id_cliente") SELECT "id_cliente" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE TABLE "new_Empresa" (
    "id_empresa" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);
INSERT INTO "new_Empresa" ("id_empresa") SELECT "id_empresa" FROM "Empresa";
DROP TABLE "Empresa";
ALTER TABLE "new_Empresa" RENAME TO "Empresa";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
