import { getRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import bcrypt from 'bcrypt';

export class ProfileService {
  // 닉네임 변경
  async updateNickname(userId: number, newNickname: string): Promise<User> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    user.nickname = newNickname;
    await userRepository.save(user);

    return user;
  }

  // 비밀번호 변경
  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await userRepository.save(user);
  }

  // 회원 탈퇴
  async deleteAccount(userId: number): Promise<void> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    await userRepository.remove(user);
  }
}
