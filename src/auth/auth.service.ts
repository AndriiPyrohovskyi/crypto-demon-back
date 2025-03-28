import { Injectable } from '@nestjs/common';
import { admin, clientAuth, signInWithEmailAndPassword } from '../auth/firebase';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(clientAuth, email, password);
    const token = await cred.user.getIdToken();
    return { token };
  }

  async verifyToken(token: string) {
    return admin.auth().verifyIdToken(token);
  }
}
