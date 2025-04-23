import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Put('')
  async updateUser(@Req() req, @Body() userData: Partial<User>) {
    const userId = req.user.uid; 
    return this.service.updateUser(userId, userData);
  }
  
  @Get('profile')
  getProfile(@Req() req) {
  return req.user;
}
}
