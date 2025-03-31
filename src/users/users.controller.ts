import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import { CreateUserDto } from './dto/create-user.dto';

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
  return req.user;
  }
  @Post('register')
  @UseGuards(AuthMiddleware)
  async registerUser(@Body() dto: CreateUserDto, @Req() req) {
    return this.service.registerUser(dto);
  }
  @Get('me')
  @UseGuards(AuthMiddleware)
  async getMe(@Req() req) {
    const firebaseUid = req.user.uid;
    const user = await this.service.findByFirebaseUid(firebaseUid);
    if (!user) throw new NotFoundException();
    await this.service.updateLastLogin(user.id);
    return user;
  }
}
