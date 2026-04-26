import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "利用規約 | Jiro Log",
};

const sections = [
  {
    title: "第1条（適用）",
    content: `本規約は、Jiro Log（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で当サービスを利用するものとします。`,
  },
  {
    title: "第2条（利用資格）",
    content: `当サービスはラーメン二郎直系店舗の訪問記録・レビューを目的としたサービスです。13歳未満の方はご利用いただけません。`,
  },
  {
    title: "第3条（禁止事項）",
    content: `ユーザーは以下の行為を行ってはなりません。

・虚偽の情報の投稿
・他のユーザーへの誹謗中傷・嫌がらせ
・店舗・従業員への不当な批判や名誉毀損
・著作権・肖像権を侵害するコンテンツの投稿
・スパムや商業目的の投稿
・当サービスのシステムへの不正アクセス
・その他、法令または公序良俗に反する行為`,
  },
  {
    title: "第4条（投稿コンテンツ）",
    content: `ユーザーが投稿したレビュー・画像等のコンテンツに関する著作権はユーザー本人に帰属します。ただし、当サービスはサービス運営・改善のために投稿コンテンツを使用する権利を有します。

不適切なコンテンツは予告なく削除する場合があります。`,
  },
  {
    title: "第5条（免責事項）",
    content: `当サービスは非公式ファンサイトであり、有限会社ラーメン二郎とは一切関係ありません。

当サービスに掲載されている店舗情報・営業時間等は変更される場合があります。最新情報は各店舗の公式情報をご確認ください。

当サービスの利用により生じた損害について、運営者は一切の責任を負いません。`,
  },
  {
    title: "第6条（サービスの変更・終了）",
    content: `運営者は予告なくサービスの内容を変更、または終了することがあります。`,
  },
  {
    title: "第7条（規約の変更）",
    content: `本規約は予告なく変更される場合があります。変更後も当サービスを継続して利用した場合、変更後の規約に同意したものとみなします。`,
  },
  {
    title: "第8条（準拠法）",
    content: `本規約は日本法に準拠し、解釈されるものとします。`,
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12 pb-20">
        <div className="mb-10">
          <p className="text-xs text-gray-400 mb-2">最終更新: 2026年4月26日</p>
          <h1 className="text-3xl font-black text-gray-900">利用規約</h1>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Jiro Logをご利用いただく前に、以下の利用規約をお読みください。
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
