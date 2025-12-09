-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "access_token" TEXT NOT NULL,
    "client_token" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "user_properties" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "selected" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Launcher" (
    "path" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "javaPath" TEXT
);
