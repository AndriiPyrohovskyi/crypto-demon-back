import { Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from './firebase';
import { UsersService } from '../users/users.service';
import e from 'express';
import { UserCurrencyService } from '../user-currency/user-currency.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userCurrencyService: UserCurrencyService, 
  ) {}

  async getUser(firebaseUid: string) {   
    const user = await this.usersService.findUser({ uid: firebaseUid });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { user };
  }

  async registerUser(email: string, username: string, firebaseUid: string) {
    const user = await this.usersService.create({
      email: email,
      username: username,
      firebaseUid: firebaseUid,
      avatar_url: null,
      role: 'user',
      last_login: null,
      created_at: new Date(),
    });
    await this.userCurrencyService.createOrUpdate(firebaseUid, 'USDT', 0); 
    return { user };
  }

  async deleteUser(uid: string) {
    await this.usersService.deleteUser(uid); 
    return admin.auth().deleteUser(uid);
  }
}
