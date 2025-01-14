import type { AppUser } from '~/domain/entities/app-user';

export interface AppUserRepository {
  getAppUserByUsername(username: string): Promise<AppUser | null>;
  createAppUser(username: string, nickname: string): Promise<AppUser>;
  createAppUserPlayers(appUserId: AppUser['id'], players: string[]): Promise<void>;
}
