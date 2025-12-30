import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session?.value) {
    return null;
  }

  // ユーザーが存在するか確認
  const user = await prisma.user.findUnique({
    where: { userId: session.value },
  });

  return user ? { userId: user.userId } : null;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

