import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

@Injectable()
export class PasswordService {
  async hash(password: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(password: string, hash: string) {
    const [algorithm, salt, storedKey] = hash.split(':');
    if (algorithm !== 'scrypt' || !salt || !storedKey) return false;

    const storedBuffer = Buffer.from(storedKey, 'hex');
    const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;
    return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
  }
}
