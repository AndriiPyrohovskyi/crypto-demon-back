import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}
  
  @Post('')
  async transfer(@Body() data: {
    recipientName: string;
    symbol: string;
    amount: number;
  },@Req() req: Request) {
    const transaction = await this.service.transfer(
      {
        senderUid: req['user'].uid,
        recipientName: data.recipientName,
        symbol: data.symbol,
        amount: data.amount,
      },
    );
    return {
      status: 'success',
      message: 'Переказ успішно виконано',
      transaction,
    };
  }

  @Get('')
  async getUserTransactions(@Req() req: Request) {
    const transactions = await this.service.getUserTransactions(req['user'].uid);
    return {
      status: 'success',
      transactions,
    };
  }
}