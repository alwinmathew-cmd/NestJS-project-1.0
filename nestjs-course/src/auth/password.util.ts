import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

// Returns "salt:hash" (both hex). The plain password is never stored.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');         //diff for diff login/registering, random salt for each password
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');//changes w/ diff salt, as salt itself is a para.
  return `${salt}:${hash}`;
}
//So, diff attempts always result in diff data= salt:hash, only seeded users have same data,as their 
// salt os same, so is password


export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
