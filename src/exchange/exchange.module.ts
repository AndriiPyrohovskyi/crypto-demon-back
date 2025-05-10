import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from './exchange.entity';
import { UserCurrencyModule } from '../user-currency/user-currency.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exchange]),
    UserCurrencyModule,
    TransactionModule,
    CurrencyModule,
  ],
  providers: [ExchangeService],
  controllers: [ExchangeController],
  exports: [ExchangeService],
})
export class ExchangeModule {}
