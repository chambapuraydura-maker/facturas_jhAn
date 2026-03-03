-- CreateTable
CREATE TABLE "Categorias" (
    "id_cate" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoria" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Carta" (
    "id_carta" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carta" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" INTEGER NOT NULL,
    CONSTRAINT "Carta_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categorias" ("id_cate") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id_empresa" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);
