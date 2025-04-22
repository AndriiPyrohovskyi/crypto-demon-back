import { Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase';
import { UsersService } from '../users/users.service';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async getUser(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken.email) {
        throw new UnauthorizedException('Email is required');
      }
      const user = await this.usersService.findUser({
        uid: decodedToken.uid
      });
      if(!user){
        throw new UnauthorizedException('User not found');
      }
      return {user};
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error; 
      }
      throw new UnauthorizedException('Invalid or expired token'+error);
    }
  }

  async registerUser(email: string, username: string, firebaseUid: string) {
    const user = await this.usersService.create({
      email: email,
      username: username,
      firebaseUid: firebaseUid,
      balance: 0, 
      avatar_url: null, 
      role: 'user',
      last_login: null, 
      created_at: new Date(), 
    });
    return {user};
  }

  async deleteUser(uid: string) {
    this.usersService.deleteUser(uid);
    return admin.auth().deleteUser(uid);
  }
}
