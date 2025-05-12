import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TradeModule } from './trade/trade.module';
import { TransactionModule } from './transaction/transaction.module';
import { CurrencyModule } from './currency/currency.module';
import { ExchangeModule } from './exchange/exchange.module';
import { User } from './users/user.entity';
import { UserCurrency } from './user-currency/user-currency.entity';
import { UserCurrencyModule } from './user-currency/user-currency.module';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { stat } from 'fs';
import { StatisticsModule } from './statistics/statistics.module';
import { Admin } from 'typeorm';
import { AdminGuard } from './AdminGuard';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }), UsersModule, TradeModule, TransactionModule, CurrencyModule, ExchangeModule, UserCurrencyModule, StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseAuthGuard, AdminGuard],
})
export class AppModule {}