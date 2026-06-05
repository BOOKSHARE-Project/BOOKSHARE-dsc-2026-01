export const HASH_PROVIDER = 'HASH_PROVIDER';

export interface HashProvider {
  hash(payload: string): Promise<string>;
  compare(payload: string, hashed: string): Promise<boolean>;
}
