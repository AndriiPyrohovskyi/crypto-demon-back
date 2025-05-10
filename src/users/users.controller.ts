import { Body, Controller, Get, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку усіх користувачів' })
  @ApiResponse({
    status: 200,
    description: 'Список користувачів',
    schema: { example: [{ uid: 'abc123', email: 'user@example.com', username: 'user123' }] },
  })
  getAll() {
    return this.service.findAll();
  }

  @Put('')
  @ApiOperation({ summary: 'Оновлення даних користувача' })
  @ApiBody({
    schema: {
      example: { email: 'new@example.com', username: 'newusername' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Дані користувача оновлено',
    schema: { example: { uid: 'abc123', email: 'new@example.com', username: 'newusername' } },
  })
  async updateUser(@Req() req, @Body() userData: Partial<User>) {
    const user= await this.service.updateUser(req.user.uid, userData);
    return {
    status: 'success',
    message: 'Дані користувача оновлено',
    user,
    };
  }
  
  @Get('profile')
  @ApiOperation({ summary: 'Отримання профілю користувача' })
  @ApiResponse({
    status: 200,
    description: 'Данні профілю користувача',
    schema: { example: { uid: 'abc123', email: 'user@example.com', username: 'user123', avatarUrl: 'url' } },
  })
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Завантаження аватара користувача' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Аватар завантажено',
    schema: { example: { avatarUrl: 'https://res.cloudinary.com/demo/avatar.jpg' } },
  })
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.service.uploadAvatar(req.user.uid, file);
  }
}