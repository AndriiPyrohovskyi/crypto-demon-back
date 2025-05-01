import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trade.entity';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { UsersModule } from '../users/users.module';
import { CurrencyModule } from 'src/currency/currency.module';
import { UserCurrencyModule } from 'src/user-currency/user-currency.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trade]), UsersModule, CurrencyModule, UserCurrencyModule],
  providers: [TradeService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}