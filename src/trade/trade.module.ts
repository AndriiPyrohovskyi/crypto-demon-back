import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trade.entity';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { UsersModule } from '../users/users.module';
import { CurrencyModule } from '../currency/currency.module';
import { UserCurrencyModule } from '../user-currency/user-currency.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trade]), UsersModule, CurrencyModule, UserCurrencyModule],
  providers: [TradeService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}