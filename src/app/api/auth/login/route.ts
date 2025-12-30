import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json();

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'ユーザーIDとパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // セッション用のレスポンスを作成
    const response = NextResponse.json(
      { message: 'ログイン成功', userId: user.userId },
      { status: 200 }
    );

    // セッションクッキーを設定（7日間有効）
    response.cookies.set('session', user.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('ログインエラー:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

