"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { sendContactEmail } from "./actions";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";

const CATEGORIES = ["バグ報告", "機能要望", "その他"];

export default function ContactPage() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await sendContactEmail(new FormData(e.currentTarget));
    setPending(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "送信に失敗しました");
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-4 py-10 pb-16">
        <h1 className="text-2xl font-black text-gray-900 mb-1">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mb-8">
          内容を確認の上、対応いたします。返答できない場合もあります。
        </p>

        {success ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-black text-gray-900">送信しました</p>
            <p className="text-sm text-gray-500 mt-1">お問い合わせありがとうございます。</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
            {/* 名前 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                名前 <span className="text-red-500 text-xs">必須</span>
              </label>
              <input
                type="text"
                name="name"
                required
                maxLength={50}
                placeholder="山田 太郎"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent"
              />
            </div>

            {/* メール */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                メールアドレス <span className="text-red-500 text-xs">必須</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent"
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                カテゴリ <span className="text-red-500 text-xs">必須</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="cursor-pointer">
                    <input type="radio" name="category" value={cat} required className="sr-only peer" />
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-bold border border-gray-200 text-gray-600 peer-checked:bg-[#FFFF00] peer-checked:border-black peer-checked:text-black transition-colors">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 本文 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                内容 <span className="text-red-500 text-xs">必須</span>
              </label>
              <textarea
                name="message"
                required
                rows={6}
                maxLength={1000}
                placeholder="お問い合わせ内容を入力してください"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 bg-[#FFFF00] text-black font-black rounded-xl hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pending ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  送信する
                </>
              )}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
