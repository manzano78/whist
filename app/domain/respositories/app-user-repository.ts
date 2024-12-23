import type { AppUser } from '~/domain/entities/app-user';

export interface AppUserRepository {
  getAppUser(username: string): Promise<AppUser | null>;
  saveAppUser(appUser: AppUser): Promise<void>;
}
