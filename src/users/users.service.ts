import { Injectable, NotFoundException } from '@nestjs/common';
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
    throw new NotFoundException('Користувача не знайдено');
  }  
  create(user: Partial<User>): Promise<User> {
    const newUser = this.repo.create(user);
    return this.repo.save(newUser);
  }

  async findById(userId: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    return user;
  }

  async updateBalance(userId: number, amount: number): Promise<User> {
    const user = await this.findById(userId);
    const currentBalance = parseFloat(user.balance.toString());
    const newBalance = currentBalance + amount;
    if (newBalance < 0) {
      throw new Error('Недостатньо коштів для виконання операції');
    }
    user.balance = newBalance;
    return await this.repo.save(user);
  }
}

