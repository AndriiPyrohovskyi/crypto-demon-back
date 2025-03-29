import { Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async verifyToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken.email) {
        throw new UnauthorizedException('Email is required');
      }
      await this.usersService.findOrCreateUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
      });
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUser(uid: string) {
    return admin.auth().getUser(uid);
  }

  async createUser(email: string, password: string) {
    return admin.auth().createUser({ email, password });
  }

  async deleteUser(uid: string) {
    return admin.auth().deleteUser(uid);
  }
}
