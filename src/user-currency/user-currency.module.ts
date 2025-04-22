import { Module } from '@nestjs/common';
import { UserCurrencyService } from './user-currency.service';
import { UserCurrencyController } from './user-currency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCurrency } from './user-currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCurrency])],
  providers: [UserCurrencyService],
  controllers: [UserCurrencyController],
  exports: [UserCurrencyService],
})
export class UserCurrencyModule {}
