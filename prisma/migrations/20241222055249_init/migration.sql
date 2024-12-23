-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GamePlayer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GamePlayer" ("gameId", "id", "name", "weight") SELECT "gameId", "id", "name", "weight" FROM "GamePlayer";
DROP TABLE "GamePlayer";
ALTER TABLE "new_GamePlayer" RENAME TO "GamePlayer";
CREATE TABLE "new_PlayerRoundResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "player" TEXT NOT NULL,
    "roundResultId" INTEGER NOT NULL,
    "call" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    CONSTRAINT "PlayerRoundResult_roundResultId_fkey" FOREIGN KEY ("roundResultId") REFERENCES "RoundResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlayerRoundResult" ("call", "id", "player", "result", "roundResultId") SELECT "call", "id", "player", "result", "roundResultId" FROM "PlayerRoundResult";
DROP TABLE "PlayerRoundResult";
ALTER TABLE "new_PlayerRoundResult" RENAME TO "PlayerRoundResult";
CREATE TABLE "new_RoundResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weight" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "RoundResult_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoundResult" ("gameId", "id", "weight") SELECT "gameId", "id", "weight" FROM "RoundResult";
DROP TABLE "RoundResult";
ALTER TABLE "new_RoundResult" RENAME TO "RoundResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
