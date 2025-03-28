import { Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase';

@Injectable()
export class AuthService {
  async verifyToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
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
