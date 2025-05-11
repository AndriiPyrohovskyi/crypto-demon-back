import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TradeService } from './trade/trade.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const tradeServiceInstance = app.get(TradeService);

  console.log('🔄 Worker started...');

  while (true) {
    try {
      await tradeServiceInstance.checkAndCloseTrades();
    } catch (error) {
      console.error('❌ Error in worker:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); 
  }
}

bootstrap();