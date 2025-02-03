import bcrypt from "bcrypt";
import AppDataSource from "../data-source";
import { User } from "../entities/user.entity";
import { generateToken } from "../utils/jwt.util";

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);

  async checkEmailDuplicate(email: string): Promise<boolean> {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    return existingUser !== null;
  }
  async register(email: string, password: string): Promise<void> {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("이미 가입된 이메일입니다.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      email,
      password: hashedPassword,
      isVerified: false,
    });
    await this.userRepo.save(newUser);
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    if (code !== "1234") {
      return false;
    }

    user.isVerified = true;
    await this.userRepo.save(user);
    return true;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    if (!user.isVerified) {
      throw new Error("이메일 인증이 완료되지 않았습니다.");
    }

    return generateToken({ userId: user.id, email: user.email});
  }

  async logout(token: string): Promise<void> {}
}
