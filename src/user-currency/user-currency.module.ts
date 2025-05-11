import { Module } from '@nestjs/common';
import { UserCurrencyService } from './user-currency.service';
import { UserCurrencyController } from './user-currency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCurrency } from './user-currency.entity';
import { UsersModule } from '../users/users.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserCurrency]),UsersModule, CurrencyModule],
  providers: [UserCurrencyService],
  controllers: [UserCurrencyController],
  exports: [UserCurrencyService],
})
export class UserCurrencyModule {}
