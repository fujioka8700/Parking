import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const parkingType = searchParams.get("parkingType") || null;

    // 検索条件を構築
    const searchCondition: any = {};

    if (parkingType) {
      // 駐車場タイプのマッピング
      const parkingTypeMapping: Record<string, string> = {
        tower_m: 'タワーパーク（M）',
        tower_mt: 'タワーパーク（MT）',
        lift_c: 'リフトパーク（C）',
        lift_vertical_front: 'リフトパーク（縦列・前側）',
        lift_vertical_back: 'リフトパーク（縦列・奥側）',
        slide_slmt_slm: 'スライドパーク円（SLMT、SLM）',
        slide_sl_tl_sl_l: 'スライドパーク円（SL-TL、SL-L）',
        shift: 'シフトパーク',
      };
      searchCondition.parkingType = parkingTypeMapping[parkingType] || parkingType;
    }

    if (query.trim()) {
      searchCondition.OR = [
        { sensorCode: { contains: query, mode: "insensitive" as const } },
        { sensorName: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ];
    }

    const sensors = await prisma.sensorStatus.findMany({
      where: searchCondition,
      orderBy: { sensorCode: "asc" as const },
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


