import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  async updateProfile(
    userId: number,
    nickname?: string,
    email?: string,
    newPassword?: string
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    if (nickname) user.nickname = nickname;
    if (email) user.email = email;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

    await this.userRepo.save(user);
  }

  async getUserMenu(userId: number): Promise<{ name: string; path: string }[]> {
    return [
      { name: 'My Page', path: `/users/${userId}` },
      { name: 'Community', path: '/community' },
      { name: 'Map & Calendar', path: '/map-calendar' },
    ];
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    await this.userRepo.remove(user);
  }
}
