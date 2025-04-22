import { Controller, Post, Body, Get, Query, Delete, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; username: string; firebaseUid: string }) {
    return this.authService.registerUser(body.email, body.username, body.firebaseUid);
  }

  @Get('user')
  getUserByToken(@Req() req: Request) {
    return this.authService.getUser(req['user'].uid);
  }

  @Delete('user')
  deleteUser(@Req() req: Request) {
    return this.authService.deleteUser(req['user'].uid);
  }
}
