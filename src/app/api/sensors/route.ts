import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parkingType = searchParams.get("parkingType") || null;

    const whereCondition: any = {};
    if (parkingType) {
      whereCondition.parkingType = parkingType;
    }

    const sensors = await prisma.sensorStatus.findMany({
      where: whereCondition,
      orderBy: { sensorCode: "asc" as const },
    });

    return NextResponse.json({ sensors });
  } catch (error: any) {
    console.error("エラー:", error);
    console.error("エラーメッセージ:", error?.message);
    console.error("エラースタック:", error?.stack);
    return NextResponse.json(
      { 
        error: "データの取得中にエラーが発生しました",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}




