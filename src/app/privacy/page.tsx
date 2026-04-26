import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "プライバシーポリシー | Jiro Log",
};

const sections = [
  {
    title: "1. 収集する情報",
    content: `当サービスでは、Googleアカウントを通じてログインする際に以下の情報を取得します。

・お名前（表示名）
・メールアドレス（内部管理のみ使用、外部には公開されません）
・プロフィール画像URL

また、サービス利用に伴い以下の情報を収集します。

・投稿されたレビュー内容（評価・コメント・画像）
・訪問店舗の記録
・いいね・フォローの履歴`,
  },
  {
    title: "2. 情報の利用目的",
    content: `収集した情報は以下の目的にのみ使用します。

・アカウントの作成・認証
・レビューの投稿・表示
・称号の付与
・サービスの改善・不正利用の防止

収集した情報を第三者に販売・提供することはありません。`,
  },
  {
    title: "3. 情報の保存",
    content: `ユーザーデータはSupabase（米国）のサーバーに保存されます。Supabaseはセキュリティ基準に準拠したクラウドデータベースサービスです。`,
  },
  {
    title: "4. Cookieについて",
    content: `当サービスでは認証状態の維持のためにCookieを使用します。ブラウザの設定によりCookieを無効にすることができますが、その場合一部の機能が利用できなくなる場合があります。`,
  },
  {
    title: "5. ユーザーの権利",
    content: `ユーザーは以下の権利を有します。

・アカウントの削除（お問い合わせにより対応）
・投稿したレビューの削除
・プロフィール情報の変更

アカウント削除をご希望の場合は下記連絡先までお問い合わせください。`,
  },
  {
    title: "6. 未成年者について",
    content: `当サービスは13歳未満の方の利用を想定していません。13歳未満の方がアカウントを作成した場合、発覚次第アカウントを削除します。`,
  },
  {
    title: "7. プライバシーポリシーの変更",
    content: `本ポリシーは予告なく変更される場合があります。重要な変更がある場合はサービス内でお知らせします。`,
  },
  {
    title: "8. お問い合わせ",
    content: `プライバシーに関するご質問・ご要望は以下までご連絡ください。\n\nJiro Log 運営チーム\nharuharu2082@icloud.com`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-20">
        <div className="mb-10">
          <p className="text-xs text-gray-400 mb-2">最終更新: 2026年4月26日</p>
          <h1 className="text-3xl font-black text-gray-900">プライバシーポリシー</h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Jiro Log（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーでは、当サービスが収集する情報とその利用方法について説明します。
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="border-l-2 border-[#FFFF00] pl-5">
              <h2 className="text-base font-black text-gray-900 mb-3">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
