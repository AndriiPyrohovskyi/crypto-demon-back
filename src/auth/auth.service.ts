import { Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase';
import { UsersService } from '../users/users.service';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async getUser(firebaseUid: string) {   
      const user = await this.usersService.findUser({ uid: firebaseUid });
      if(!user){
        throw new UnauthorizedException('User not found');
      }
      return {user};
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
