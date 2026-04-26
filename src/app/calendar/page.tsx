import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "./CalendarView";

export const metadata = { title: "訪問カレンダー | Jiro Log" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/calendar");

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-black mb-6">訪問カレンダー</h1>
        <CalendarView userId={user.id} isOwner={true} />
      </main>
      <Footer />
    </>
  );
}
