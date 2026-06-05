import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HashProvider } from './hash-provider.interface';

@Injectable()
export class BCryptHashProvider implements HashProvider {
  async hash(payload: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(payload, salt);
  }

  async compare(payload: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(payload, hashed);
  }
}
