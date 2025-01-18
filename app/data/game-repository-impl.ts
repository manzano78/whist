import type { GameRepository } from '~/domain/respositories/game-repository';
import type { Game } from '~/domain/entities/game';
import type { RoundResult } from '~/domain/entities/round-result';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { GameListItem } from '~/domain/entities/game-list-item';

type GameDto = Prisma.GameGetPayload<{
  include: {
    roundResults: {
      include: {
        playerRoundResults: true
      }
    },
    playersInOrder: true,
  }
}>;

function toGame(gameDto: GameDto): Game {
  const {
    ownerId,
    creationDate,
    roundResults,
    playersInOrder,
    id,
  } = gameDto

  return {
    id,
    ownerId,
    creationDate,
    playersInOrder: playersInOrder
      .sort(({ weight: weight1 }, { weight: weight2 }) => weight1 - weight2)
      .map(({ name }) => name),
    roundResults: roundResults
      .sort(({ weight: weight1 }, { weight: weight2 }) => weight1 - weight2)
      .map(({ playerRoundResults }) =>
        playerRoundResults.reduce((acc, { player, result, call }) => {
          acc[player] = {
            call,
            result,
          };

          return acc;
        }, {} as RoundResult),
      ),
  };
}

export class GameRepositoryImpl implements GameRepository {
  constructor(private prismaClient: PrismaClient) {}

  async getGame(ownerId: number, id: string): Promise<Game> {
    const gameDto = await this.prismaClient.game.findUniqueOrThrow({
      where: {
        id,
        ownerId
      },
      include: {
        roundResults: {
          include: {
            playerRoundResults: true
          }
        },
        playersInOrder: true,
      },
    });

    return toGame(gameDto);
  }

  async deleteGames(ownerId: number, gameIds: Game['id'][]): Promise<void> {
    await this.prismaClient.game.deleteMany({
      where: {
        ownerId,
        id: {
          in: gameIds,
        },
      }
    });
  }

  async getLastTerminatedGame(ownerId: number): Promise<Game | null> {
    const gameDto = await this.prismaClient.game.findFirst({
      where: {
        ownerId,
        isTerminated: true,
      },
      include: {
        roundResults: {
          include: {
            playerRoundResults: true
          }
        },
        playersInOrder: true,
      },
      orderBy: {
        creationDate: 'desc'
      }
    });

    return gameDto && toGame(gameDto);
  }

  async createGame(ownerId: number, playersInOrder: string[]): Promise<Game> {
    const { id, creationDate } = await this.prismaClient.game.create({
      data: {
        ownerId,
        playersInOrder: {
          create: playersInOrder.map((name, weight) => ({
            name,
            weight,
          }))
        }
      }
    });

    return {
      id,
      ownerId,
      creationDate,
      playersInOrder,
      roundResults: [],
    };
  }

  async terminateGame(gameId: Game["id"]): Promise<void> {
    await this.prismaClient.game.update({
      where: {
        id: gameId,
      },
      data: {
        isTerminated: true,
      }
    });
  }

  async getGames(ownerId: number, page: number, size: number, isTerminated?: boolean): Promise<{
    list: GameListItem[];
    page: number;
    size: number;
    totalElements: number;
  }> {
    const [
      list,
      totalElements,
    ] = await Promise.all([
      this.prismaClient.game.findMany({
        skip: (page - 1) * size,
        take: size,
        select: {
          id: true,
          creationDate: true,
          playersInOrder: true,
          isTerminated: true,
          _count: {
            select: {
              roundResults: true,
            }
          }
        },
        where: {
          ownerId,
          isTerminated,
        },
        orderBy: {
          creationDate: 'desc'
        }
      }),
      this.prismaClient.game.count({
        where: {
          ownerId,
          isTerminated,
        }
      })
    ]);

    return {
      page,
      size,
      totalElements,
      list: list.map((
        {
          isTerminated,
          creationDate,
          playersInOrder,
          id,
          _count: {
            roundResults: totalPassedRounds,
          }
        }
      ) => ({
        id,
        isTerminated,
        creationDate,
        totalPassedRounds,
        playersInOrder: playersInOrder.map(({ name }) => name),
      }))
    };
  }
}
