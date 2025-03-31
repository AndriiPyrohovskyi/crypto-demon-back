// auth.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { admin } from './firebase';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req['user'] = decoded;
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
