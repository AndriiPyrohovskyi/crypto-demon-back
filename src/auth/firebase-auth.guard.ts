import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { admin } from '../auth/firebase';
import { UsersService } from '../users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}
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
      try {
        await this.usersService.updateUser(decodedToken.uid, { last_login: new Date() });
      } catch (e) {
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}