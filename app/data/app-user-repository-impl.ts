import type { AppUserRepository } from '~/domain/respositories/app-user-repository';
import type { AppUser } from '~/domain/entities/app-user';
import type { PrismaClient } from '@prisma/client';

export class AppUserRepositoryImpl implements AppUserRepository {
  constructor(private prismaClient: PrismaClient) {}
  async getAppUser(username: string): Promise<AppUser | null> {
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

  async saveAppUser(appUser: AppUser): Promise<void> {
    const id = appUser.id;

    if (id === null) {
      const { id: userId } = await this.prismaClient.user.create({
        data: {
          username: appUser.username,
          nickname: appUser.nickname,
          players: {
            create: appUser.players.map((name) => ({
              name,
              ownerId: id,
            }))
          }
        }
      });

      appUser.id = userId;
    } else {
      await this.prismaClient.$transaction([
        this.prismaClient.userPlayer.deleteMany({
          where: {
            ownerId: id
          }
        }),
        this.prismaClient.userPlayer.createMany({
          data: appUser.players.map((name) => ({
            name,
            ownerId: id,
          }))
        })
      ]);
    }
  }
}
