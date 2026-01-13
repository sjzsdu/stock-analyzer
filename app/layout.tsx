import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "股票智能分析 - AI驱动的投资决策助手",
  description: "基于AI多Agent协作的股票分析平台，支持A股、港股、美股",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
