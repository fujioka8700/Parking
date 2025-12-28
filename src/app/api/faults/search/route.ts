import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ faults: [] });
    }

    // 検索条件を構築
    // SQLiteでは mode: "insensitive" がサポートされていないため削除
    const orConditions: any[] = [
      { faultCode: { contains: query } },
      { faultName: { contains: query } },
      { faultContent: { contains: query } },
    ];

    // displayCodeがNULLでない場合のみ検索条件に追加
    orConditions.push({
      AND: [
        { displayCode: { not: null } },
        { displayCode: { contains: query } },
      ],
    });

    const searchCondition: any = {
      OR: orConditions,
      // isActiveの条件を削除して、欠番も含めて全データを検索可能にする
    };

    const faults = await prisma.faultMaster.findMany({
      where: searchCondition,
      take: 100, // 最大100件
    });

    // 故障コードを数値としてソート（1, 2, 3, ..., 10, 11, ..., 100, ...）
    const sortedFaults = [...faults].sort((a, b) => {
      const codeA = parseInt(a.faultCode, 10);
      const codeB = parseInt(b.faultCode, 10);
      // 数値に変換できない場合は最後に配置
      if (isNaN(codeA) && isNaN(codeB)) {
        return a.faultCode.localeCompare(b.faultCode);
      }
      if (isNaN(codeA)) return 1;
      if (isNaN(codeB)) return -1;
      return codeA - codeB;
    });

    return NextResponse.json({ faults: sortedFaults });
  } catch (error) {
    console.error("検索エラー:", error);
    return NextResponse.json(
      { error: "検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

