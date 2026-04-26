"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PenLine } from "lucide-react";

export function FAB() {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      router.push("/post");
    } else {
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#FFFF00] text-black font-bold text-sm rounded-full shadow-lg hover:bg-yellow-300 active:scale-95 transition-all"
      aria-label="レビューを投稿する"
    >
      <PenLine className="w-4 h-4" />
      <span>レビューを投稿する</span>
    </button>
  );
}
