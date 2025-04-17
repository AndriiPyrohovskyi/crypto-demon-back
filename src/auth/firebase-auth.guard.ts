import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from '../auth/firebase';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken; 
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}