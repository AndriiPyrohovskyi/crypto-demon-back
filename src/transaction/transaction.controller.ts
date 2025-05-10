import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post('')
  @ApiOperation({ summary: 'Виконання переказу між користувачами' })
  @ApiBody({
    schema: { example: { recipientName: 'user123', symbol: 'BTC', amount: 0.5 } },
  })
  @ApiResponse({
    status: 201,
    description: 'Переказ успішно виконано',
    schema: {
      example: {
        status: 'success',
        message: 'Переказ успішно виконано',
        transaction: { id: 1, senderUid: 'uid123', recipientName: 'user123', symbol: 'BTC', amount: 0.5 },
      },
    },
  })
  async transfer(
    @Body() data: {
      recipientName: string;
      symbol: string;
      amount: number;
    },
    @Req() req: Request,
  ) {
    const transaction = await this.service.transfer({
      senderUid: req['user'].uid,
      recipientName: data.recipientName,
      symbol: data.symbol,
      amount: data.amount,
    });
    return {
      status: 'success',
      message: 'Переказ успішно виконано',
      transaction,
    };
  }

  @Get('')
  @ApiOperation({ summary: 'Отримання транзакцій користувача' })
  @ApiResponse({
    status: 200,
    description: 'Список транзакцій користувача',
    schema: { example: [{ id: 1, symbol: 'BTC', amount: 0.5 }] },
  })
  async getUserTransactions(@Req() req: Request) {
    const transactions = await this.service.getUserTransactions(req['user'].uid);
    return {
      status: 'success',
      transactions,
    };
  }
}