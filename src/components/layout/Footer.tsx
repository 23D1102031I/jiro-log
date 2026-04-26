import Link from "next/link";

const footerLinks = [
  { href: "/", label: "ホーム" },
  { href: "/map", label: "店舗マップ" },
  { href: "/stamp", label: "スタンプカード" },
  { href: "/post", label: "レビュー投稿" },
];

export function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      {/* Yellow accent line */}
      <div className="h-1 bg-[#FFFF00]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span
              className="text-3xl tracking-wider"
              style={{
                fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif",
              }}
            >
              <span className="text-white">Jiro </span>
              <span className="text-[#FFFF00]">Log</span>
            </span>
            <p className="text-gray-400 text-xs mt-1">ジロリアンの記録帳</p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-300 hover:text-[#FFFF00] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-400 leading-relaxed">
            当サイトは非公式ファンサイトであり、有限会社ラーメン二郎とは一切関係ありません。
          </p>
          <div className="flex gap-4 mt-3">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-[#FFFF00] transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-[#FFFF00] transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-[#FFFF00] transition-colors">
              お問い合わせ
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            © 2026 Jiro Log. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
