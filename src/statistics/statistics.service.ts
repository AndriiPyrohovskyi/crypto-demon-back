import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from '../exchange/exchange.entity';
import { Trade } from '../trade/trade.entity';
import { Transaction } from '../transaction/transaction.entity';
import { UserCurrency } from '../user-currency/user-currency.entity';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepo: Repository<Exchange>,
    @InjectRepository(Trade)
    private readonly tradeRepo: Repository<Trade>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(UserCurrency)
    private readonly userCurrencyRepo: Repository<UserCurrency>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getCombinedCommissionData(): Promise<{
    totalCommission: number;
    commissionChartData: { month: string; totalCommission: number }[];
  }> {
    const tradeResult = await this.tradeRepo
      .createQueryBuilder('trade')
      .select('SUM(trade.fixed_company_profit)', 'totalTradeCommission')
      .getRawOne();
    const totalTradeCommission = parseFloat(tradeResult.totalTradeCommission) || 0;
  
    const transactionResult = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.fee)', 'totalTransactionFee')
      .getRawOne();
    const totalTransactionFee = parseFloat(transactionResult.totalTransactionFee) || 0;
  
    const totalCommission = totalTradeCommission + totalTransactionFee;

    const tradeChartData = await this.tradeRepo
      .createQueryBuilder('trade')
      .select("TO_CHAR(DATE_TRUNC('month', trade.created_at), 'YYYY-MM')", 'month')
      .addSelect('SUM(trade.fixed_company_profit)', 'monthTradeCommission')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  
    const transactionChartData = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select("TO_CHAR(DATE_TRUNC('month', transaction.created_at), 'YYYY-MM')", 'month')
      .addSelect('SUM(transaction.fee)', 'monthTransactionFee')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  
      const chartMap = new Map<string, number>();
    tradeChartData.forEach((item) => {
      chartMap.set(item.month, parseFloat(item.monthTradeCommission) || 0);
    });
    transactionChartData.forEach((item) => {
      const prev = chartMap.get(item.month) || 0;
      chartMap.set(item.month, prev + (parseFloat(item.monthTransactionFee) || 0));
    });
  
    const commissionChartData = Array.from(chartMap.entries())
      .map(([month, totalCommission]) => ({ month, totalCommission }))
      .sort((a, b) => a.month.localeCompare(b.month));
  
    return { totalCommission, commissionChartData };
  }

  async getExchangeVolume(period: 'day' | 'week' | 'month'): Promise<any[]> {
    let dateFunc = "DATE_TRUNC('day', transaction.created_at)";
    if (period === 'week') {
      dateFunc = "DATE_TRUNC('week', transaction.created_at)";
    } else if (period === 'month') {
      dateFunc = "DATE_TRUNC('month', transaction.created_at)";
    }
    
    return this.exchangeRepo
      .createQueryBuilder('exchange')
      .leftJoin('exchange.transaction_from', 'transaction')
      .select(`${dateFunc}`, 'date')
      .addSelect('SUM(exchange.fromAmount)', 'total_from')
      .addSelect('SUM(exchange.toAmount)', 'total_to')
      .where(`${dateFunc} IS NOT NULL`)
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getTradeVolume(period: 'day' | 'week' | 'month'): Promise<any[]> {
    let dateFunc = "DATE_TRUNC('day', trade.created_at)";
    if (period === 'week') dateFunc = "DATE_TRUNC('week', trade.created_at)";
    else if (period === 'month') dateFunc = "DATE_TRUNC('month', trade.created_at)";
    return this.tradeRepo
      .createQueryBuilder('trade')
      .select(`${dateFunc}`, 'date')
      .addSelect('SUM(trade.margin)', 'totalMargin')
      .addSelect('SUM(trade.value)', 'totalValue')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }


  async getTransactionFees(): Promise<{ totalFees: number }> {
    const result = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.fee)', 'totalFees')
      .getRawOne();
    return { totalFees: parseFloat(result.totalFees) || 0 };
  }

 
  async getUserStatistics(): Promise<{ totalUsers: number; averageBalance: number }> {
    const usersBalances = await this.userCurrencyRepo
      .createQueryBuilder('uc')
      .select('uc.user_id', 'userId')
      .addSelect('SUM(uc.balance)', 'userBalance')
      .groupBy('uc.user_id')
      .getRawMany();
    const totalUsers = usersBalances.length;
    const sumBalance = usersBalances.reduce((acc, cur) => acc + parseFloat(cur.userBalance), 0);
    const averageBalance = totalUsers ? sumBalance / totalUsers : 0;
    return { totalUsers, averageBalance };
  }

  async getTopUsers(limit = 5): Promise<any[]> {
    return this.userCurrencyRepo
      .createQueryBuilder('uc')
      .select('uc.user_id', 'userId')
      .addSelect('SUM(uc.balance)', 'totalBalance')
      .groupBy('uc.user_id')
      .orderBy('"totalBalance"', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getAverageTradeProfit(): Promise<{ averageProfit: number }> {
    const result = await this.tradeRepo
      .createQueryBuilder('trade')
      .select('AVG(trade.fixed_user_profit)', 'averageProfit')
      .where("trade.status = 'closed'")
      .getRawOne();
    return { averageProfit: parseFloat(result.averageProfit) || 0 };
  }

  async getRecentTrades(): Promise<Trade[]> {
    return this.tradeRepo
      .createQueryBuilder('trade')
      .orderBy('trade.created_at', 'DESC')
      .limit(10)
      .getMany();
  }

  async getNewUsersCount(): Promise<{ date: string; count: number }[]> {
    return this.usersRepo
      .createQueryBuilder('user')
      .select("TO_CHAR(DATE_TRUNC('day', user.created_at), 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(user.id)', 'count')
      .where("user.created_at >= NOW() - INTERVAL '7 days'")
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  async getHighestEarningUser(): Promise<{ userId: string; totalProfit: number }> {
    const result = await this.tradeRepo
      .createQueryBuilder('trade')
      .leftJoin('trade.transaction_from', 'transaction')
      .leftJoin('transaction.sender', 'sender')
      .select('sender.firebaseUid', 'userId')
      .addSelect('SUM(trade.fixed_user_profit)', 'totalProfit')
      .where("trade.status = 'closed'")
      .groupBy('sender.firebaseUid')
      .orderBy('totalProfit', 'DESC')
      .limit(1)
      .getRawOne();
    return {
      userId: result.userId,
      totalProfit: parseFloat(result.totalProfit) || 0,
    };
  }
}