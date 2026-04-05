/*
  Warnings:

  - You are about to alter the column `heroSlides` on the `configuracion` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "titulo" TEXT,
    "subtitulo" TEXT,
    "duracion" INTEGER NOT NULL DEFAULT 5,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "configuracionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "hero_slides_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "configuracion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_configuracion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "instagram" TEXT,
    "facebook" TEXT,
    "direccion" TEXT NOT NULL,
    "heroSlides" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_configuracion" ("createdAt", "direccion", "email", "facebook", "heroSlides", "id", "instagram", "telefono", "updatedAt", "whatsapp") SELECT "createdAt", "direccion", "email", "facebook", "heroSlides", "id", "instagram", "telefono", "updatedAt", "whatsapp" FROM "configuracion";
DROP TABLE "configuracion";
ALTER TABLE "new_configuracion" RENAME TO "configuracion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
