import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UsersService {
  userRepository: any;
  constructor(@InjectRepository(User) private repo: Repository<User>) {
    this.userRepository = repo;
  }  
  findAll(): Promise<User[]> {
    return this.repo.find();
  }
  async updateLastLogin(id: number) {
    await this.repo.update(id, { last_login: new Date() });
  }  
  async registerUser(dto: CreateUserDto) {
    const existing = await this.repo.findOne({ where: { firebaseUid: dto.firebaseUid } });
    if (existing) return existing;
  
    return this.repo.save({
      ...dto,
      balance: 10,
      avatar_url: "https://surl.li/stmpwu",
      createdAt: new Date(),
      lastLoginAt: new Date()
    });
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
  async findByFirebaseUid(uid: string) {
    return this.repo.findOne({ where: { firebaseUid: uid } });
  }  
}

