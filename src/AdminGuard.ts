import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const uid = req.user?.uid;
    if (!uid) {
      throw new ForbiddenException('Користувача не знайдено');
    }
    
    const user = await this.usersService.findUser({ uid });
    if (!user || !user.role || !user.role.includes('admin')) {
      throw new ForbiddenException('Доступ заборонено');
    }
    return true;
  }
}