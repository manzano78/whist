import type { GameRepository } from '~/domain/respositories/game-repository';
import type { Game } from '~/domain/entities/game';
import type { RoundResult } from '~/domain/entities/round-result';
import type { Prisma, PrismaClient } from '@prisma/client';
import { type RoundDraft } from '~/domain/entities/draft';

type GameDto = Prisma.GameGetPayload<{
  include: {
    roundResults: {
      include: {
        playerRoundResults: true
      }
    },
    playersInOrder: true,
    roundDraft: {
      include: {
        results: true,
        calls: true
      }
    },
  }
}>;

function toDraft(roundDraftDto: GameDto['roundDraft']): RoundDraft | undefined {
  if (!roundDraftDto) {
    return undefined;
  }

  const { calls: callEntities, callIndex, roundIndex, isFixing, isInError, results } = roundDraftDto;
  const calls = callEntities.map(({ call }) => call);

  if (callIndex !== null) {
    return {
      calls,
      callIndex,
      roundIndex,
      isFixing: isFixing!,
      isInError: isInError!,
    };
  } else {
    return {
      calls,
      roundIndex,
      results: results.map(({ result }) => result),
    };
  }
}

function toGame(gameDto: GameDto): Game {
  const {
    ownerId,
    creationDate,
    roundDraft,
    roundResults,
    playersInOrder,
    id,
  } = gameDto

  return {
    id,
    ownerId,
    creationDate,
    draft: toDraft(roundDraft),
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

  async getGame(id: string): Promise<Game> {
    const gameDto = await this.prismaClient.game.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        roundResults: {
          include: {
            playerRoundResults: true
          }
        },
        playersInOrder: true,
        roundDraft: {
          include: {
            results: true,
            calls: true,
          }
        }
      },
    });

    return toGame(gameDto);
  }

  // async getCurrentGame(appUser: AppUser): Promise<Game | null> {
  //   const appUserId = appUser.id;
  //
  //   if (appUserId === null) {
  //     throw new Error("Can't fetch games of an app user that does not have an ID");
  //   }
  //
  //   const gameDto= await this.prismaClient.game.findFirst({
  //     where: {
  //       ownerId: appUserId,
  //       isTerminated: false,
  //     },
  //     include: {
  //       roundResults: {
  //         include: {
  //           playerRoundResults: true
  //         }
  //       },
  //       playersInOrder: true,
  //       roundDraft: {
  //         include: {
  //           results: true,
  //           calls: true,
  //         }
  //       }
  //     },
  //   });
  //
  //   return gameDto && toGame(gameDto);
  // }

  // async saveGame(game: Game): Promise<void> {
  //   let gameId = game.getId();
  //
  //   const appUserId = game.owner.id;
  //
  //   if (appUserId === null) {
  //     throw new Error("Can't save a game whose app user owner that does not have an ID");
  //   }
  //
  //   if (gameId === null) {
  //     const { id } = await this.prismaClient.game.create({
  //       data: {
  //         ownerId: appUserId,
  //         isTerminated: game.isTerminated(),
  //         creationDate: game.creationDate,
  //         playersInOrder: {
  //           create: game.playersInOrder.map((player, i) => ({
  //             name: player,
  //             weight: i
  //           }))
  //         },
  //         roundResults: {
  //           create: game.roundResults.map((roundResult, weight) => ({
  //             weight,
  //             playerRoundResults: {
  //               create: Object.entries(roundResult).map(([player, { call, result }]) => ({
  //                 player,
  //                 call,
  //                 result,
  //               }))
  //             }
  //           }))
  //         },
  //         roundDraft: {
  //           create: game.roundDraft ? {
  //             roundIndex: game.roundDraft.roundIndex,
  //             isFixing: isCallsStepDraft(game.roundDraft) ? game.roundDraft.isFixing : null,
  //             callIndex: isCallsStepDraft(game.roundDraft) ? game.roundDraft.callIndex : null,
  //             isInError: isCallsStepDraft(game.roundDraft) ? game.roundDraft.isInError : null,
  //             calls: {
  //               create: game.roundDraft.calls.map((call) => ({ call })),
  //             },
  //             results: isResultsStepDraft(game.roundDraft) ? {
  //               create: game.roundDraft.results.map((result) => ({ result })),
  //             } : undefined,
  //           } : undefined,
  //         },
  //       }
  //     });
  //
  //     game.setId(id);
  //   } else {
  //     await this.prismaClient.game.update({
  //       where: {
  //         id: gameId,
  //       },
  //       data: {
  //         ownerId: appUserId,
  //         isTerminated: game.isTerminated(),
  //         creationDate: game.creationDate,
  //         roundDraft: {
  //           create: game.roundDraft ? {
  //             roundIndex: game.roundDraft.roundIndex,
  //             isFixing: isCallsStepDraft(game.roundDraft) ? game.roundDraft.isFixing : null,
  //             callIndex: isCallsStepDraft(game.roundDraft) ? game.roundDraft.callIndex : null,
  //             isInError: isCallsStepDraft(game.roundDraft) ? game.roundDraft.isInError : null,
  //             calls: {
  //               create: game.roundDraft.calls.map((call) => ({ call })),
  //             },
  //             results: isResultsStepDraft(game.roundDraft) ? {
  //               create: game.roundDraft.results.map((result) => ({ result })),
  //             } : undefined,
  //           } : undefined,
  //         },
  //         playersInOrder: {
  //           set: [],
  //           create: game.playersInOrder.map((name, weight) => ({
  //             name,
  //             weight
  //           })),
  //         },
  //         roundResults: {
  //           set: [],
  //           create: game.roundResults.map((roundResult, weight) => ({
  //             weight,
  //             playerRoundResults: {
  //               create: Object.entries(roundResult).map(([player, { call, result }]) => ({
  //                 player,
  //                 call,
  //                 result
  //               }))
  //             }
  //           }))
  //         }
  //       }
  //     });
  //   }
  // }

  async deleteGame(gameId: Game['id']): Promise<void> {
    await this.prismaClient.game.delete({
      where: {
        id: gameId,
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
        roundDraft: {
          include: {
            results: true,
            calls: true,
          }
        }
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
}
