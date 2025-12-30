import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'ログアウト成功' }, { status: 200 });
  
  // セッションクッキーを削除
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

