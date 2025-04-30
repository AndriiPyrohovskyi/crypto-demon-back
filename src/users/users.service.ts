import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import toStream = require('buffer-to-stream');

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>,  @Inject('CLOUDINARY') private cloudinary: any,) {}

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

  async deleteUser(uid: string): Promise<void> {
    const user = await this.repo.findOne({ where: { firebaseUid: uid } });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }
    await this.repo.remove(user);
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, userData);
    return await this.repo.save(user);
  }

  async uploadAvatar(firebaseUid: string, file: Express.Multer.File) {
    const user = await this.repo.findOneBy({ firebaseUid });
    if (!user) throw new Error('User not found');

    const result = await this.uploadToCloudinary(file);
    user.avatar_url = result.secure_url;
    this.repo.save(user);
    return({massege: 'Avatar uploaded successfully', url: result.secure_url});
  }

  private uploadToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: result is undefined'));
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}

