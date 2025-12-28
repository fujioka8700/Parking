import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    // 検索条件を構築
    const searchCondition: any = {};

    if (query.trim()) {
      // SQLiteでは mode: "insensitive" がサポートされていないため削除
      searchCondition.OR = [
        { sensorCode: { contains: query } },
        { sensorName: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const sensors = await prisma.sensorStatus.findMany({
      where: searchCondition,
      orderBy: { sensorCode: "asc" },
      take: 100, // 最大100件
    });

    return NextResponse.json({ sensors });
  } catch (error) {
    console.error("検索エラー:", error);
    return NextResponse.json(
      { error: "検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}


