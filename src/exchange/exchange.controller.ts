import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly service: ExchangeService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку всіх обмінів' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Створити заявку на обмін' })
  @ApiBody({
    schema: {
      example: {
        recipientName: 'user2',
        fromSymbol: 'BTC',
        fromAmount: 0.1,
        toSymbol: 'USDT'
      },
    },
  })
  async createExchangeRequest(@Body() body, @Req() req) {
    return this.service.createExchangeRequest(
      req.user.uid,
      body.recipientName,
      body.fromSymbol,
      body.fromAmount,
      body.toSymbol,
    );
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Підтвердити обмін' })
  async confirmExchange(@Param('id') id: number, @Req() req) {
    return this.service.confirmExchange(
      id,
      req.user.uid,
    );
  }

  @Get('my')
  @ApiOperation({ summary: 'Мої заявки на обмін' })
  async myRequests(@Req() req) {
    return this.service.findMyRequests(req.user.uid);
  }

  @Get('incoming')
  @ApiOperation({ summary: 'Заявки на обмін, які адресовані мені' })
  async incoming(@Req() req) {
    return this.service.findIncomingOffers(req.user.uid);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Скасувати заявку на обмін' })
  async cancel(@Param('id') id: number, @Req() req) {
    return this.service.cancelExchange(id, req.user.uid);
  }
}