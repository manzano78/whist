-- CreateTable
CREATE TABLE "RoundDraft" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "callIndex" INTEGER,
    "isInError" BOOLEAN,
    "isFixing" BOOLEAN,
    CONSTRAINT "RoundDraft_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoundDraftCall" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "call" INTEGER NOT NULL,
    "roundDraftId" INTEGER NOT NULL,
    CONSTRAINT "RoundDraftCall_roundDraftId_fkey" FOREIGN KEY ("roundDraftId") REFERENCES "RoundDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoundDraftResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "result" INTEGER NOT NULL,
    "roundDraftId" INTEGER NOT NULL,
    CONSTRAINT "RoundDraftResult_roundDraftId_fkey" FOREIGN KEY ("roundDraftId") REFERENCES "RoundDraft" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundDraft_gameId_key" ON "RoundDraft"("gameId");
