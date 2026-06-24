import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-dev';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Alias for verifyPassword for convenience
 */
export const comparePassword = verifyPassword;

/**
 * Generate a JWT token
 * @param payload - Object containing user data to encode
 * @returns JWT token string
 */
export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract and verify user from Authorization header
 * @param request - Request object with headers
 * @returns Decoded user payload or null if not authenticated
 */
export function getAuthUser(request: Request): JWTPayload | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Try cookie as fallback
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
    );
    if (cookies.auth_token) {
      return verifyToken(cookies.auth_token);
    }
  }

  return null;
}

/**
 * Extract token from request (for middleware use)
 * @param request - Request object with headers
 * @returns Token string or null
 */
export function extractToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie as fallback
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
    );
    return cookies.auth_token || null;
  }

  return null;
}

/**
 * Get current user from request (for API routes)
 * @param request - Request object with headers
 * @returns User payload with additional info or null if not authenticated
 */
export async function getCurrentUser(request: Request): Promise<JWTPayload | null> {
  return getAuthUser(request);
}