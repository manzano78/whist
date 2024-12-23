import { GameRepository } from '~/domain/respositories/game-repository';
import { Game } from '~/domain/entities/game';
import { RoundResult } from '~/domain/entities/round-result';
import { AppUser } from '~/domain/entities/app-user';
import { prismaClient } from '~/data/prisma-client';
import { Prisma } from '@prisma/client';

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

function toGame(gameDto: GameDto, appUser: AppUser): Game {
  return new Game(
    gameDto.id,
    appUser,
    gameDto.creationDate,
    gameDto
      .playersInOrder
      .sort(({ weight: weight1 }, { weight: weight2 }) => weight1 - weight2)
      .map(({ name }) => name),
    gameDto
      .roundResults
      .sort(({ weight: weight1 }, { weight: weight2 }) => weight1 - weight2)
      .map(({ playerRoundResults }) =>
        playerRoundResults.reduce((acc, { player, result, call }) => {
          acc[player] = {
            call,
            result,
          };

          return acc;
        }, {} as RoundResult)
      ),
  );
}

export class GameRepositoryImpl implements GameRepository {
  async getCurrentGame(appUser: AppUser): Promise<Game | null> {
    const appUserId = appUser.id;

    if (appUserId === null) {
      throw new Error("Can't fetch games of an app user that does not have an ID");
    }

    const gameDto= await prismaClient.game.findFirst({
      where: {
        ownerId: appUserId,
        isTerminated: false,
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

    return gameDto && toGame(gameDto, appUser);
  }

  async saveGame(game: Game): Promise<void> {
    let gameId = game.getId();

    const appUserId = game.owner.id;

    if (appUserId === null) {
      throw new Error("Can't save a game whose app user owner that does not have an ID");
    }

    if (gameId === null) {
      const { id } = await prismaClient.game.create({
        data: {
          ownerId: appUserId,
          isTerminated: game.isTerminated(),
          creationDate: game.creationDate,
          playersInOrder: {
            create: game.playersInOrder.map((player, i) => ({
              name: player,
              weight: i
            }))
          },
          roundResults: {
            create: game.roundResults.map((roundResult, i) => ({
              weight: i,
              playerRoundResults: {
                create: Object.entries(roundResult).map(([player, { call, result }]) => ({
                  player,
                  call,
                  result,
                }))
              }
            }))
          }
        }
      });

      game.setId(id);
    } else {
      await prismaClient.game.update({
        where: {
          id: gameId,
        },
        data: {
          ownerId: appUserId,
          isTerminated: game.isTerminated(),
          creationDate: game.creationDate,
        }
      });

      await prismaClient.$transaction(async (tx) => {
        await Promise.all([
          tx.gamePlayer.deleteMany({
            where: {
              gameId: gameId,
            }
          }),
          tx.roundResult.deleteMany({
            where: {
              gameId: gameId,
            }
          })
        ]);

        await Promise.all(
          [
            tx.gamePlayer.createMany({
              data: game.playersInOrder.map((player, i) => ({
                name: player,
                weight: i,
                gameId,
              }))
            }),
            ...game.roundResults.map(
              (roundResult, i) =>
                tx.roundResult.create({
                  data: {
                    gameId,
                    weight: i,
                    playerRoundResults: {
                      create: Object.entries(roundResult).map(([player, {call, result}]) => ({
                        player,
                        call,
                        result,
                      }))
                    }
                  }
                })
            )
          ]
        )
      });
    }
  }

  async deleteGame(game: Game): Promise<void> {
    const id = game.getId();

    if (id === null) {
      throw new Error("Can't delete a game that does not have an ID");
    }

    await prismaClient.game.delete({
      where: {
        id
      }
    });
  }

  async getLastTerminatedGame(appUser: AppUser): Promise<Game | null> {
    const appUserId = appUser.id;

    if (appUserId === null) {
      throw new Error("Can't fetch games of an app user that does not have an ID");
    }

    const gameDto = await prismaClient.game.findFirst({
      where: {
        ownerId: appUserId,
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

    return gameDto && toGame(gameDto, appUser);
  }
}

export const gameRepository = new GameRepositoryImpl();
