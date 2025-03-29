import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './trade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trade])],
  providers: [TradeService],
  controllers: [TradeController],
  exports: [TradeService],
})
export class TradeModule {}
