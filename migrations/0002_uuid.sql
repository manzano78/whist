-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" INTEGER NOT NULL,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTerminated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Game_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("creationDate", "id", "isTerminated", "ownerId") SELECT "creationDate", "id", "isTerminated", "ownerId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_GamePlayer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GamePlayer" ("gameId", "id", "name", "weight") SELECT "gameId", "id", "name", "weight" FROM "GamePlayer";
DROP TABLE "GamePlayer";
ALTER TABLE "new_GamePlayer" RENAME TO "GamePlayer";
CREATE TABLE "new_RoundResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "RoundResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoundResult" ("gameId", "id", "weight") SELECT "gameId", "id", "weight" FROM "RoundResult";
DROP TABLE "RoundResult";
ALTER TABLE "new_RoundResult" RENAME TO "RoundResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
