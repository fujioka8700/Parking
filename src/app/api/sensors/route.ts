import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sensors = await prisma.sensorStatus.findMany({
      orderBy: { sensorCode: "asc" },
    });

    return NextResponse.json({ sensors });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "データの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}




