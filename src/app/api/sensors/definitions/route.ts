import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  try {
    // Dockerコンテナ内では /data にマウントされている
    const filePath = "/data/mt_sensor.json";
    const fileContents = fs.readFileSync(filePath, "utf8");
    const sensorDefinitions = JSON.parse(fileContents);

    return NextResponse.json({ sensorDefinitions });
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "センサ定義データの取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

