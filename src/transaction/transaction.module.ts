import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { UsersModule } from '../users/users.module';
import { CurrencyModule } from '../currency/currency.module';
import { UserCurrencyModule } from '../user-currency/user-currency.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]),UsersModule,CurrencyModule,UserCurrencyModule],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
