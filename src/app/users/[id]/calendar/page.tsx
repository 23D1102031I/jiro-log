import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/app/calendar/CalendarView";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("username").eq("id", id).single();
  if (!data) return { title: "訪問カレンダー | Jiro Log" };
  return {
    title: `${data.username}の訪問カレンダー | Jiro Log`,
    description: `${data.username}のラーメン二郎訪問カレンダー`,
  };
}

export default async function UserCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, username")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const isOwner = authUser?.id === id;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/users/${id}`}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="プロフィールに戻る"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black">
            {profile.username}の訪問カレンダー
          </h1>
        </div>
        <CalendarView userId={id} isOwner={isOwner} />
      </main>
      <Footer />
    </>
  );
}
