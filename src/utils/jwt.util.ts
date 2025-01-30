import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.type';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const EXPIRES_IN = '1d';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    return null;
  }
}
