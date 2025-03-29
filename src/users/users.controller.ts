import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() user: Partial<User>) {
    return this.service.create(user);
  }
  @Get('profile')
  getProfile(@Req() req) {
  return req.user; // тут вже decoded Firebase токен
}
}
