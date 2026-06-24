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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_configuracion" ("createdAt", "direccion", "email", "facebook", "heroSlides", "id", "instagram", "telefono", "updatedAt", "whatsapp") SELECT "createdAt", "direccion", "email", "facebook", "heroSlides", "id", "instagram", "telefono", "updatedAt", "whatsapp" FROM "configuracion";
DROP TABLE "configuracion";
ALTER TABLE "new_configuracion" RENAME TO "configuracion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
