import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from './exchange.entity';
import { Repository, IsNull } from 'typeorm';
import { UserCurrencyService } from '../user-currency/user-currency.service';
import { TransactionService } from '../transaction/transaction.service';
import { CurrencyService } from '../currency/currency.service';

@Injectable()
export class ExchangeService {
  constructor(
    @InjectRepository(Exchange) private repo: Repository<Exchange>,
    private userCurrencyService: UserCurrencyService,
    private transactionService: TransactionService,
    private currencyService: CurrencyService,
  ) {}

  async findAll(): Promise<Exchange[]> {
    return this.repo.find({
      relations: [
        'transaction_from', 'transaction_from.sender', 'transaction_from.recipient', 'transaction_from.currency',
        'transaction_to', 'transaction_to.sender', 'transaction_to.recipient', 'transaction_to.currency'
      ]
    });
  }

  async createExchangeRequest(
    senderUid: string,
    recipientName: string,
    fromSymbol: string,
    fromAmount: number,
    toSymbol: string,
  ): Promise<Exchange> {
    if (fromSymbol === toSymbol) throw new BadRequestException('Валюти мають бути різними');
    if (fromAmount <= 0) throw new BadRequestException('Сума має бути більшою за 0');
    await this.userCurrencyService.reserveBalance(senderUid, fromSymbol, fromAmount);

    const fromPrice = await this.currencyService.getCurrencyBySymbol(fromSymbol);
    const toPrice = await this.currencyService.getCurrencyBySymbol(toSymbol);
    if (!fromPrice?.price || !toPrice?.price) throw new BadRequestException('Не вдалося отримати ціну в USD');

    const usdValue = fromAmount * fromPrice.price;
    const toAmount = parseFloat((usdValue / toPrice.price).toFixed(8));
    const exchangeRate = fromPrice.price / toPrice.price;

    const exchange = this.repo.create({
      fromSymbol,
      fromAmount,
      fromPriceUsd: fromPrice.price,
      toSymbol,
      toAmount,
      toPriceUsd: toPrice.price,
      exchangeRate,
      status: 'pending',
    });
    return this.repo.save(exchange);
  }

  async confirmExchange(
    exchangeId: number,
    confirmerUid: string,
  ): Promise<Exchange> {
    const exchange = await this.repo.findOne({
      where: { id: exchangeId },
      relations: ['transaction_from', 'transaction_from.sender', 'transaction_from.recipient'],
    });
    if (!exchange) throw new NotFoundException('Exchange not found');
    if (exchange.status !== 'pending') throw new BadRequestException('Exchange is not pending');

    if (exchange.transaction_from.recipient.firebaseUid !== confirmerUid) {
      throw new ForbiddenException('Only recipient can confirm this exchange');
    }

    const fromPrice = await this.currencyService.getCurrencyBySymbol(exchange.fromSymbol);
    const toPrice = await this.currencyService.getCurrencyBySymbol(exchange.toSymbol);
    if (!fromPrice?.price || !toPrice?.price) throw new BadRequestException('Не вдалося отримати ціну в USD');

    const fromDiff = Math.abs(fromPrice.price - Number(exchange.fromPriceUsd)) / Number(exchange.fromPriceUsd);
    const toDiff = Math.abs(toPrice.price - Number(exchange.toPriceUsd)) / Number(exchange.toPriceUsd);
    if (fromDiff > 0.01 || toDiff > 0.01) {
      throw new BadRequestException('Курс змінився. Оновіть заявку на обмін.');
    }

    const usdFrom = Number(exchange.fromAmount) * Number(exchange.fromPriceUsd);
    const usdTo = Number(exchange.toAmount) * Number(exchange.toPriceUsd);
    if (Math.abs(usdFrom - usdTo) > 0.01) {
      throw new BadRequestException('Обмін не є рівноцінним!');
    }

    await this.userCurrencyService.reserveBalance(confirmerUid, exchange.toSymbol, exchange.toAmount);
    await this.userCurrencyService.spendReserved(confirmerUid, exchange.toSymbol, exchange.toAmount);
    await this.userCurrencyService.spendReserved(exchange.transaction_from.sender.firebaseUid, exchange.fromSymbol, exchange.fromAmount);

    const transactionFrom = await this.transactionService.transfer({
      senderUid: exchange.transaction_from.sender.firebaseUid,
      recipientName: exchange.transaction_from.recipient.username,
      symbol: exchange.fromSymbol,
      amount: Number(exchange.fromAmount),
      skipBalanceCheck: true,
      skipFee: true,
    });

    const transactionTo = await this.transactionService.transfer({
      senderUid: confirmerUid,
      recipientName: exchange.transaction_from.sender.username,
      symbol: exchange.toSymbol,
      amount: Number(exchange.toAmount),
      skipBalanceCheck: true,
      skipFee: true,
    });

    exchange.transaction_from = transactionFrom;
    exchange.transaction_to = transactionTo;
    exchange.status = 'confirmed';
    return this.repo.save(exchange);
  }

  async findMyRequests(initiatorUid: string): Promise<Exchange[]> {
    return this.repo.find({
      where: {
        status: 'pending',
        transaction_from: { sender: { firebaseUid: initiatorUid } },
      },
      relations: ['transaction_from', 'transaction_from.sender', 'transaction_to'],
    });
  }

  async findIncomingOffers(recipientUid: string): Promise<Exchange[]> {
    return this.repo.find({
      where: {
        status: 'pending',
        transaction_to: IsNull(),
        transaction_from: { recipient: { firebaseUid: recipientUid } },
      },
      relations: ['transaction_from', 'transaction_from.sender', 'transaction_from.recipient'],
    });
  }

  async cancelExchange(exchangeId: number, userUid: string): Promise<Exchange> {
    const exchange = await this.repo.findOne({
      where: { id: exchangeId },
      relations: ['transaction_from', 'transaction_from.sender', 'transaction_from.recipient'],
    });
    if (!exchange) throw new NotFoundException('Exchange not found');
    if (exchange.status !== 'pending') throw new BadRequestException('Exchange is not pending');

    const isInitiator = exchange.transaction_from.sender.firebaseUid === userUid;
    const isRecipient = exchange.transaction_from.recipient.firebaseUid === userUid;
    if (!isInitiator && !isRecipient)
      throw new ForbiddenException('You can cancel only your own or incoming exchange requests');

    await this.userCurrencyService.releaseReservedBalance(
      exchange.transaction_from.sender.firebaseUid,
      exchange.fromSymbol,
      exchange.fromAmount
    );

    exchange.status = 'cancelled';
    return this.repo.save(exchange);
  }
}

