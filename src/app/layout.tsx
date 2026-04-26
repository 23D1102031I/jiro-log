import type { Metadata } from "next";
import { Bebas_Neue, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jiro Log - ジロリアンの記録帳",
  description:
    "ラーメン二郎直系店舗専用レビュー＆スタンプラリーアプリ。あなたの一杯を記録しよう。",
  openGraph: {
    title: "Jiro Log",
    description: "ラーメン二郎直系専用レビューアプリ",
    type: "website",
  },
  verification: {
    google: "l2bH5xZtny8vtfHrU9Jsrv0aZwQyHJRg8-Fy2sUlZl8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${bebasNeue.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
