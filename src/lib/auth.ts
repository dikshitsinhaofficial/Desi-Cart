import { NextRequest } from 'next/server';

export function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const [role, email] = token.split('_');
  if (!role || !email) return null;
  return { role, email };
}
