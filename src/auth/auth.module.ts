import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UserCurrencyModule } from '../user-currency/user-currency.module';

@Module({
  imports: [UsersModule, UserCurrencyModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
