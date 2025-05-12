import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/AdminGuard';

@ApiTags('Statistics')
@UseGuards(AdminGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly service: StatisticsService) {}

  @Get('commission-data')
  @ApiOperation({ summary: 'Отримання загального прибутку з комісій та даних для графіку комісій' })
  @ApiResponse({
    status: 200,
    description: 'Комбінована інформація про комісії',
    schema: { example: { totalCommission: 123.45, commissionChartData: [{ month: '2025-03', totalCommission: '12.34' }] } },
  })
  async getCombinedCommissionData() {
    return this.service.getCombinedCommissionData();
  }

  @Get('exchange-volume')
  @ApiOperation({ summary: 'Отримання обʼєму обмінів за вказаний період' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], required: false, description: 'Період групування (за замовчуванням day)' })
  @ApiResponse({
    status: 200,
    description: 'Дані обʼєму обмінів',
    schema: { example: [{ date: '2025-03-01', total_from: '0.5', total_to: '15000' }] },
  })
  async getExchangeVolume(@Query('period') period: string = 'day') {
    return this.service.getExchangeVolume(period as 'day' | 'week' | 'month');
  }

  @Get('trade-volume')
  @ApiOperation({ summary: 'Отримання обʼєму трейдів за вказаний період' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], required: false, description: 'Період групування (за замовчуванням day)' })
  @ApiResponse({
    status: 200,
    description: 'Дані обʼєму трейдів',
    schema: { example: [{ date: '2025-03-01', totalMargin: '50', totalValue: '500' }] },
  })
  async getTradeVolume(@Query('period') period: string = 'day') {
    return this.service.getTradeVolume(period as 'day' | 'week' | 'month');
  }  

  @Get('user-stats')
  @ApiOperation({ summary: 'Отримання статистики користувачів: кількість та середній баланс' })
  @ApiResponse({
    status: 200,
    description: 'Статистика користувачів',
    schema: { example: { totalUsers: 100, averageBalance: 235.67 } },
  })
  async getUserStatistics() {
    return this.service.getUserStatistics();
  }

  @Get('top-users')
  @ApiOperation({ summary: 'Отримання топ користувачів за сумою балансу' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Кількість (за замовчуванням 5)' })
  @ApiResponse({
    status: 200,
    description: 'Список топ користувачів',
    schema: { example: [{ userId: 1, totalBalance: 1000.50 }] },
  })
  async getTopUsers(@Query('limit') limit: string = '5') {
    return this.service.getTopUsers(parseInt(limit, 10));
  }

  @Get('average-trade-profit')
  @ApiOperation({ summary: 'Отримання середнього прибутку по закритих трейдах' })
  @ApiResponse({
    status: 200,
    description: 'Середній прибуток по трейдах',
    schema: { example: { averageProfit: 15.67 } },
  })
  async getAverageTradeProfit() {
    return this.service.getAverageTradeProfit();
  }

  @Get('recent-trades')
  @ApiOperation({ summary: 'Отримання останніх 10 трейдів' })
  @ApiResponse({
    status: 200,
    description: 'Список останніх трейдів',
    schema: { example: [{ id: 1, type: 'buy', margin: 100, status: 'closed' }] },
  })
  async getRecentTrades() {
    return this.service.getRecentTrades();
  }

  @Get('new-users')
  @ApiOperation({ summary: 'Отримання кількості нових користувачів за останній тиждень' })
  @ApiResponse({
    status: 200,
    description: 'Кількість нових користувачів по днях',
    schema: { example: [{ date: '2025-04-01', count: 5 }, { date: '2025-04-02', count: 7 }] },
  })
  async getNewUsersCount() {
    return this.service.getNewUsersCount();
  }

  @Get('highest-earning-user')
  @ApiOperation({ summary: 'Отримання користувача, який заробив найбільше за закритими трейдами' })
  @ApiResponse({
    status: 200,
    description: 'Найбільш прибутковий користувач',
    schema: { example: { userId: 'user123', totalProfit: 567.89 } },
  })
  async getHighestEarningUser() {
    return this.service.getHighestEarningUser();
  }
}