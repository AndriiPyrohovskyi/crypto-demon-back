import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';
import { UserCurrencyModule } from 'src/user-currency/user-currency.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule, UserCurrencyModule],
  providers: [UsersService, CloudinaryProvider],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
