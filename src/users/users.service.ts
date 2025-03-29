import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  userRepository: any;
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }
  async findOrCreateUser(data: { uid: string; email: string }) {
    let user = await this.userRepository.findOne({ where: { uid: data.uid } });
  
    if (!user) {
      user = this.userRepository.create({
        uid: data.uid,
        email: data.email,
      });
      await this.userRepository.save(user);
    }
  
    return user;
  }  
  create(user: Partial<User>): Promise<User> {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }
}

