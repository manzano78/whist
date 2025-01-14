import type { AppUserRepository } from '~/domain/respositories/app-user-repository';
import type { AppUser } from '~/domain/entities/app-user';
import type { PrismaClient } from '@prisma/client';

export class AppUserRepositoryImpl implements AppUserRepository {
  constructor(private prismaClient: PrismaClient) {}

  async getAppUserByUsername(username: string): Promise<AppUser | null> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        username,
      },
      include: {
        players: true
      }
    });

    return user && {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      players: user.players.map(({ name }) => name)
    };
  }

  async createAppUserPlayers(appUserId: AppUser["id"], players: string[]): Promise<void> {
    await this.prismaClient.userPlayer.createMany({
      data: players.map((name) => ({ name, ownerId: appUserId }))
    });
  }

  async createAppUser(username: string, nickname: string): Promise<AppUser> {
    const { id } = await this.prismaClient.user.create({
      data: {
        username,
        nickname,
      }
    });

    return {
      id,
      username,
      nickname,
      players: [],
    };
  }
}
