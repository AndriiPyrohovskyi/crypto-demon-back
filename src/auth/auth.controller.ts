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
  register(@Body() body: { email: string; username: string; firebaseUid: string }) {
    return this.authService.registerUser(body.email, body.username, body.firebaseUid);
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
