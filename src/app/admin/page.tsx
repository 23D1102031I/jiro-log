import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { AdminStoreManager } from "./AdminStoreManager";

export const metadata = { title: "管理者ページ | Jiro Log" };

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, address, region, lat, lng, closed_days, sns_url")
    .order("region")
    .order("name");

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-[#FFFF00]" />
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-none">管理者ページ</h1>
            <p className="text-xs text-gray-500 mt-1">店舗データの管理</p>
          </div>
        </div>
        <AdminStoreManager initialStores={stores ?? []} />
      </main>
      <Footer />
    </>
  );
}
