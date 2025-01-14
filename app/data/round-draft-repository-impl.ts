import type { RoundDraftRepository } from '~/domain/respositories/round-draft-repository';
import { isCallsStepDraft, isResultsStepDraft, type RoundDraft } from '~/domain/entities/draft';
import type { Game } from '~/domain/entities/game';
import type { PrismaClient } from '@prisma/client';

export class RoundDraftRepositoryImpl implements RoundDraftRepository {
  constructor(
    private readonly prismaClient: PrismaClient,
  ) {}

  async createRoundDraft(roundDraft: RoundDraft, gameId: Game["id"]): Promise<void> {
    const { roundIndex, calls } = roundDraft;
    const callsStepSpecifics = isCallsStepDraft(roundDraft) ? {
      isFixing: roundDraft.isFixing,
      isInError: roundDraft.isInError,
      callIndex: roundDraft.callIndex,
    } : {};

    await this.deleteRoundDraft(gameId);
    await this.prismaClient.roundDraft.create({
      data: {
        gameId,
        roundIndex,
        ...callsStepSpecifics,
        calls: {
          create: calls.map((call ) => ({ call }))
        },
        results: isResultsStepDraft(roundDraft) ? {
          create: roundDraft.results.map((result) => ({ result })),
        } : undefined,
      }
    })
  }

  async deleteRoundDraft(gameId: Game["id"]): Promise<void> {
    await this.prismaClient.roundDraft.deleteMany({
      where: {
        gameId,
      },
    });
  }
}
