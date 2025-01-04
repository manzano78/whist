import type { RoundResultRepository } from '~/domain/respositories/round-result-repository';
import type { PrismaClient } from '@prisma/client';
import type { RoundResult } from '~/domain/entities/round-result';

export class RoundResultRepositoryImpl implements RoundResultRepository {
  constructor(private prismaClient: PrismaClient) {}

  async createRoundResult(
    roundResult: RoundResult,
    roundIndex: number,
    gameId: string
  ): Promise<void> {
    await this.prismaClient.roundResult.create({
      data: {
        gameId,
        weight: roundIndex,
        playerRoundResults: {
          create: Object.entries(roundResult).map(([player, { call, result }]) => ({
            player,
            call,
            result,
          }))
        }
      }
    });
  }
}