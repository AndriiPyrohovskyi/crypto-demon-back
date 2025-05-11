import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { MoreThan, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CurrencyService } from '../currency/currency.service';
import { UserCurrencyService } from '../user-currency/user-currency.service';
import { User } from '../users/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction) private repo: Repository<Transaction>,
    private usersService: UsersService,
    private currencyService: CurrencyService,
    private userCurrencyService: UserCurrencyService,
  ) {}

  async getAllTransactions(): Promise<Transaction[]> {
    return this.repo.find({ relations: ['sender', 'recipient', 'currency'] });
  }

  async getUserTransactions(userUid: string): Promise<Transaction[]> {
    return this.repo.find({
      where: [
        { sender: { firebaseUid: userUid }, value: MoreThan(0) },
        { recipient: { firebaseUid: userUid }, value: MoreThan(0) }
      ],
      relations: ['sender', 'recipient', 'currency'],
    });
  }

  async transfer(data: {
    senderUid: string;
    recipientName: string;
    symbol: string;
    amount: number;
    skipBalanceCheck?: boolean;
    skipFee?: boolean;
  }): Promise<Transaction> {
    const queryRunner = this.repo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { senderUid, recipientName, symbol, amount, skipBalanceCheck, skipFee } = data;

      const sender: User = await this.usersService.findUser({ uid: senderUid });
      const recipient: User = await this.usersService.findByName(recipientName);
      if (!sender || !recipient) {
        throw new NotFoundException('Відправник або отримувача не знайдено');
      }

      const fee = skipFee ? 0 : amount * 0.01;
      const totalDeduction = amount + fee;

      if (!skipBalanceCheck) {
        const senderCurrency = await this.userCurrencyService.getOne(sender.firebaseUid, symbol);
        if (senderCurrency.balance < totalDeduction) {
          throw new BadRequestException('Недостатньо коштів для переказу');
        }
        await this.userCurrencyService.setBalance(
          sender.firebaseUid,
          symbol,
          senderCurrency.balance - totalDeduction,
        );
      }

      let recipientCurrency;
      try {
        recipientCurrency = await this.userCurrencyService.getOne(recipient.firebaseUid, symbol);
        await this.userCurrencyService.setBalance(
          recipient.firebaseUid,
          symbol,
          recipientCurrency.balance + amount,
        );
      } catch (e) {
        await this.userCurrencyService.createOrUpdate(recipient.firebaseUid, symbol, amount);
      }

      const currency = await this.currencyService.getCurrencyBySymbol(symbol);
      if (!currency) {
        throw new BadRequestException('Валюта не знайдена');
      }

      const transaction = this.repo.create({
        sender: sender,
        recipient: recipient,
        currency: currency,
        value: amount,
        price_at_transaction: currency.price ?? 0,
        fee: fee,
      });
      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();
      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}