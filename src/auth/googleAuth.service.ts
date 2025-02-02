import { getRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import { extractGoogleProfile } from './googleAuth.util';

export class GoogleAuthService {
  async findOrCreateGoogleUser(profile: any) {
    const userRepository = getRepository(User);
    const extractedProfile = extractGoogleProfile(profile);

    let user = await userRepository.findOne({ where: { googleId: extractedProfile.googleId } });

    if (!user) {
      user = userRepository.create(extractedProfile);
      await userRepository.save(user);
    }

    return user;
  }

  async findUserById(userId: number) {
    const userRepository = getRepository(User);
    return await userRepository.findOne({ where: { id: userId } });
  }
}
