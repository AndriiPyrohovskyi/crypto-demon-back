import { Controller, Post, Body, Get, Delete, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація користувача' })
  @ApiBody({
    schema: {
      example: { email: 'user@example.com', username: 'user123', firebaseUid: 'abc123' },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Користувача успішно зареєстровано',
    schema: { example: { uid: 'abc123', email: 'user@example.com', username: 'user123' } },
  })
  register(@Body() body: { email: string; username: string; firebaseUid: string }) {
    return this.authService.registerUser(body.email, body.username, body.firebaseUid);
  }

  @Get('user')
  @ApiOperation({ summary: 'Отримання даних користувача за токеном' })
  @ApiResponse({
    status: 200,
    description: 'Дані користувача',
    schema: { example: { uid: 'abc123', email: 'user@example.com', username: 'user123' } },
  })
  getUserByToken(@Req() req: Request) {
    return this.authService.getUser(req['user'].uid);
  }

  @Delete('user')
  @ApiOperation({ summary: 'Видалення користувача' })
  @ApiResponse({
    status: 200,
    description: 'Користувача видалено',
    schema: { example: { message: 'User deleted successfully' } },
  })
  deleteUser(@Req() req: Request) {
    return this.authService.deleteUser(req['user'].uid);
  }
} 