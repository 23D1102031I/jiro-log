import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { MypageClient } from "@/components/mypage/MypageClient";

export const metadata = { title: "マイページ | Jiro Log" };

export default async function MypagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/mypage");

  // User profile
  const { data: profile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/profile/setup");

  // Reviews with store info
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, images, created_at, stores(name), thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Distinct visited stores
  const { data: storeVisits } = await supabase
    .from("reviews")
    .select("store_id")
    .eq("user_id", user.id);
  const visitedStores = new Set(storeVisits?.map((r) => r.store_id) ?? []).size;

  // Total likes received
  const { count: totalLikes } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .in("review_id", reviews?.map((r) => r.id) ?? []);

  // Acquired titles (ordered by achieved_at desc)
  const { data: userTitles } = await supabase
    .from("user_titles")
    .select("title_id, achieved_at, titles(id, name, description)")
    .eq("user_id", user.id)
    .order("achieved_at", { ascending: false });

  type TitleRecord = { id: string; name: string; description: string };
  const titles = (userTitles ?? []).map((ut) => {
    const t = Array.isArray(ut.titles)
      ? (ut.titles[0] as TitleRecord | undefined)
      : (ut.titles as TitleRecord | null);
    return {
      id: t?.id ?? ut.title_id,
      name: t?.name ?? "",
      description: t?.description ?? "",
      achieved_at: ut.achieved_at,
    };
  });

  const topTitle = titles[0] ?? null;

  // Average params
  type ParamReview = {
    thickness_score: number | null;
    dero_score: number | null;
    vegetable_score: number | null;
    noodle_score: number | null;
    pork_score: number | null;
    emulsification_score: number | null;
  };

  const paramKeys: (keyof ParamReview)[] = [
    "thickness_score", "dero_score", "vegetable_score",
    "noodle_score", "pork_score", "emulsification_score",
  ];

  const totalReviews = reviews?.length ?? 0;
  const avgParams =
    totalReviews > 0
      ? paramKeys.map((k) => {
          const vals = (reviews ?? [])
            .map((r) => (r as unknown as ParamReview)[k])
            .filter((v): v is number => v != null);
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;
        })
      : [3, 3, 3, 3, 3, 3];

  const reviewsForClient = (reviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? null,
    images: r.images ?? null,
    created_at: r.created_at,
    stores: Array.isArray(r.stores) ? r.stores[0] ?? null : (r.stores as { name: string } | null),
  }));

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <MypageClient
          username={profile.username}
          avatarUrl={user.user_metadata?.avatar_url ?? profile.avatar_url ?? null}
          topTitle={topTitle}
          titles={titles}
          stats={{
            totalReviews,
            visitedStores,
            totalLikes: totalLikes ?? 0,
          }}
          avgParams={avgParams}
          reviews={reviewsForClient}
          userId={user.id}
        />
      </main>
      <Footer />
    </>
  );
}
