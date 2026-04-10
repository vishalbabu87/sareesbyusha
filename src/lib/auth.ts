import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { db } from '@/lib/db';

const SESSION_COOKIE = 'saree_studio_session';
const SESSION_DAYS = 14;

// Use Web Crypto API (Edge compatible) instead of Node.js crypto
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple hash for password (using PBKDF2 - Edge compatible)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hashArray = Array.from(new Uint8Array(bits));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return saltHex + ':' + hashHex;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, oldHashHex] = storedHash.split(':');
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hashArray = Array.from(new Uint8Array(bits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === oldHashHex;
}

export async function createSession(userId: string) {
  // Use Web Crypto for random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = await hashToken(token);
    await db.session.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });
}

export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = await hashToken(token);
  const session = await db.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
});

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function getHasUsers() {
  const count = await db.user.count();
  return count > 0;
}
