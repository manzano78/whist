import { AppUserRepository } from '~/domain/respositories/app-user-repository';
import { AppUser } from '~/domain/entities/app-user';
import { prismaClient } from '~/data/prisma-client';

class AppUserRepositoryImpl implements AppUserRepository {
  async getAppUser(username: string): Promise<AppUser | null> {
    const user = await prismaClient.user.findUnique({
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
    let id = appUser.id;

    if (id === null) {
      const userDto = await prismaClient.user.create({
        data: {
          username: appUser.username,
          nickname: appUser.nickname,
        }
      });

      appUser.id = userDto.id;
      id = userDto.id;
    } else {
      await prismaClient.userPlayer.deleteMany({
        where: {
          ownerId: id
        }
      });
    }

    if (appUser.players.length !== 0) {
      prismaClient.userPlayer.createMany({
        data: appUser.players.map((name) => ({
          name,
          ownerId: id,
        }))
      });
    }
  }
}

export const appUserRepository = new AppUserRepositoryImpl();
