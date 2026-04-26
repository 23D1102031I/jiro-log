import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "@/components/post/ReviewForm";

export const metadata = {
  title: "レビュー投稿 | Jiro Log",
};

export default async function PostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/post");

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, region")
    .order("region")
    .order("name");

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-[#FFFF00]" />
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">レビューを投稿</h1>
            <p className="text-xs text-gray-500 mt-1">今日の一杯を記録しよう</p>
          </div>
        </div>
        <ReviewForm stores={stores ?? []} />
      </main>
      <Footer />
    </>
  );
}
