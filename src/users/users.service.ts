import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }
  async findUser(data: { uid: string}) {
    let user = await this.repo.findOne({ where: { firebaseUid: data.uid } });
    if (user) {
      return user;
    }
    return null;
  }  
  create(user: Partial<User>): Promise<User> {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }
}

