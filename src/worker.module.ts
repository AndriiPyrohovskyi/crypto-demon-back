import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trade/trade.entity';
import { TradeService } from './trade/trade.service';
import { UsersModule } from './users/users.module';
import { CurrencyModule } from './currency/currency.module';
import { UserCurrencyModule } from './user-currency/user-currency.module';

@Module({
  imports: [
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
    }),
    TypeOrmModule.forFeature([Trade]),
    UsersModule,
    CurrencyModule,
    UserCurrencyModule,
  ],
  providers: [TradeService],
})
export class WorkerModule {}