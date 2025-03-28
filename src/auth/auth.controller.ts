import { Controller, Post, Body, Get, Query, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  verify(@Body('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authService.createUser(body.email, body.password);
  }

  @Get('user')
  getUser(@Query('uid') uid: string) {
    return this.authService.getUser(uid);
  }

  @Delete('user')
  deleteUser(@Query('uid') uid: string) {
    return this.authService.deleteUser(uid);
  }
}
