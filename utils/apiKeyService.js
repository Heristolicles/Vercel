import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes = 256 bits
const IV_LENGTH = 16; // For AES, this is always 16 bytes

export async function encryptApiKey(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export async function decryptApiKey(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    iv
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function saveApiKey(userId, type, key) {
  const encryptedKey = await encryptApiKey(key);
  
  // Update existing key or create new one
  return prisma.apiKey.upsert({
    where: {
      userId_type: {
        userId,
        type
      }
    },
    update: {
      key: encryptedKey
    },
    create: {
      userId,
      type,
      key: encryptedKey
    }
  });
}

export async function getApiKey(userId, type) {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      userId,
      type
    }
  });
  
  if (!apiKey) return null;
  
  return decryptApiKey(apiKey.key);
}

export async function deleteApiKey(userId, type) {
  return prisma.apiKey.delete({
    where: {
      userId_type: {
        userId,
        type
      }
    }
  });
}
