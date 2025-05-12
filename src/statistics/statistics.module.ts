import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from '../exchange/exchange.entity';
import { Trade } from '../trade/trade.entity';
import { Transaction } from '../transaction/transaction.entity';
import { UserCurrency } from '../user-currency/user-currency.entity';
import { User } from '../users/user.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange, Trade, Transaction, UserCurrency, User])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}