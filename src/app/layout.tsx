import type { Metadata } from "next";
import "./globals.css";
import { ParkingTypeProvider } from "@/contexts/ParkingTypeContext";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata: Metadata = {
  title: "立体駐車場故障対応検索システム",
  description: "故障コードとセンサ状態を検索できるシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ParkingTypeProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </ParkingTypeProvider>
      </body>
    </html>
  );
}
