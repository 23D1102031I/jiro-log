import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { UserProfileClient } from "./UserProfileClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("username").eq("id", id).single();
  if (!data) return { title: "ユーザー | Jiro Log" };
  return {
    title: `${data.username} | Jiro Log`,
    description: `${data.username}のジロリアンプロフィール`,
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get logged in user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Get target user profile
  const { data: profile } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  // All reviews for stats
  const { data: allReviews } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, images, created_at, eaten_at, store_id, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, stores(id, name)"
    )
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const reviewList = allReviews ?? [];
  const totalReviews = reviewList.length;

  // Visited stores (distinct)
  const visitedStores = new Set(reviewList.map((r) => r.store_id).filter(Boolean)).size;

  // Total likes received
  const { count: totalLikes } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .in("review_id", reviewList.map((r) => r.id));

  // Titles
  const { data: userTitles } = await supabase
    .from("user_titles")
    .select("title_id, achieved_at, titles(id, name, description)")
    .eq("user_id", id)
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

  // Follow counts
  const [{ count: followingCount }, { count: followersCount }] = await Promise.all([
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", id),
    supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", id),
  ]);

  // Is current user following this user?
  let isFollowing = false;
  if (authUser && authUser.id !== id) {
    const { data: followRow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", authUser.id)
      .eq("following_id", id)
      .single();
    isFollowing = !!followRow;
  }

  // Average params
  type ParamKey =
    | "thickness_score"
    | "dero_score"
    | "vegetable_score"
    | "noodle_score"
    | "pork_score"
    | "emulsification_score";

  const paramKeys: ParamKey[] = [
    "thickness_score", "dero_score", "vegetable_score",
    "noodle_score", "pork_score", "emulsification_score",
  ];

  type ReviewRow = typeof reviewList[number];

  const avgParams =
    totalReviews > 0
      ? paramKeys.map((k) => {
          const vals = reviewList
            .map((r: ReviewRow) => (r as unknown as Record<string, unknown>)[k])
            .filter((v): v is number => typeof v === "number");
          return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;
        })
      : [3, 3, 3, 3, 3, 3];

  // Reviews for client (latest 20)
  const reviewsForClient = reviewList.slice(0, 20).map((r) => {
    type StoreField = { id: string; name: string } | null;
    const storeData: StoreField = Array.isArray(r.stores)
      ? ((r.stores[0] as StoreField) ?? null)
      : (r.stores as StoreField);

    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment ?? null,
      images: r.images ?? null,
      created_at: r.created_at,
      eaten_at: (r as unknown as Record<string, unknown>).eaten_at as string | null ?? null,
      store_id: storeData?.id ?? r.store_id ?? null,
      storeName: storeData?.name ?? null,
    };
  });

  // Mini calendar data (current month visited days)
  const now = new Date();
  const calendarYear = now.getFullYear();
  const calendarMonth = now.getMonth();
  const y = calendarYear;
  const m = calendarMonth;
  const monthStart = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const monthEnd = `${y}-${String(m + 1).padStart(2, "0")}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, "0")}`;

  const { data: calReviews } = await supabase
    .from("reviews")
    .select("eaten_at, created_at")
    .eq("user_id", id)
    .or(`and(eaten_at.gte.${monthStart},eaten_at.lte.${monthEnd}),and(eaten_at.is.null,created_at.gte.${monthStart}T00:00:00,created_at.lte.${monthEnd}T23:59:59)`);

  const visitedDays = Array.from(new Set(
    (calReviews ?? []).map((r) =>
      Number(((r.eaten_at ?? r.created_at) as string).slice(8, 10))
    )
  ));

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F9FAFB] px-4 py-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <UserProfileClient
            userId={id}
            username={profile.username}
            avatarUrl={profile.avatar_url ?? null}
            topTitle={topTitle}
            titles={titles}
            stats={{
              totalReviews,
              visitedStores,
              totalLikes: totalLikes ?? 0,
            }}
            followCounts={{
              following: followingCount ?? 0,
              followers: followersCount ?? 0,
            }}
            avgParams={avgParams}
            reviews={reviewsForClient}
            currentUserId={authUser?.id ?? null}
            isFollowing={isFollowing}
            calendarYear={calendarYear}
            calendarMonth={calendarMonth}
            visitedDays={visitedDays}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
