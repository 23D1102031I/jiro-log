import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { RadarChart } from "@/components/mypage/RadarChart";
import { MapPin, Clock, ExternalLink, Star, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("stores").select("name, region").eq("id", id).single();
  if (!data) return { title: "店舗詳細 | Jiro Log" };
  return {
    title: `${data.name} | Jiro Log`,
    description: `${data.name}（${data.region}）のラーメン二郎レビュー`,
  };
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, address, region, business_hours, closed_days, sns_url, tags")
    .eq("id", id)
    .single();

  if (!store) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, images, created_at, call_garlic, call_yasai, call_abura, call_karame, thickness_score, dero_score, vegetable_score, noodle_score, pork_score, emulsification_score, users(id, username, avatar_url)"
    )
    .eq("store_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const reviewList = reviews ?? [];
  const totalReviews = reviewList.length;

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

  const avgRating =
    totalReviews > 0
      ? reviewList.reduce((a, r) => a + (r.rating ?? 0), 0) / totalReviews
      : 0;

  type BusinessHoursEntry = string | { open?: string; close?: string } | Record<string, string>;
  type BusinessHours = Record<string, BusinessHoursEntry>;
  const businessHours: BusinessHours | null =
    store.business_hours && typeof store.business_hours === "object"
      ? (store.business_hours as BusinessHours)
      : null;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        {/* Store header */}
        <section className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>

          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600">
            {store.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{store.address}</span>
              </div>
            )}
            {store.region && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                  {store.region}
                </span>
              </div>
            )}
            {store.closed_days && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>定休日: {store.closed_days}</span>
              </div>
            )}
          </div>

          {/* Business hours */}
          {businessHours && Object.keys(businessHours).length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">営業時間</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(businessHours).map(([day, hours]) => {
                  let hoursText: string;
                  if (typeof hours === "string") {
                    hoursText = hours;
                  } else if (hours && typeof hours === "object") {
                    const h = hours as Record<string, string>;
                    hoursText = h.open && h.close ? `${h.open} - ${h.close}` : JSON.stringify(hours);
                  } else {
                    hoursText = String(hours);
                  }
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{day}</span>
                      <span className="text-gray-900">{hoursText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SNS link */}
          {store.sns_url && (
            <a
              href={store.sns_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              公式SNS
            </a>
          )}

          {/* Tags */}
          {store.tags && Array.isArray(store.tags) && store.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(store.tags as string[]).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFFF00] text-black">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Average stats */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-3 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black" style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif" }}>
                {avgRating.toFixed(1)}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= Math.round(avgRating) ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-black text-lg text-black">{totalReviews}</span> 件のレビュー
            </div>
          </div>
        )}

        {/* My Jiro Identity radar chart */}
        <section className="mb-8">
          <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FFFF00] inline-block" />
            店舗平均 My Jiro Identity
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
            {totalReviews > 0 ? (
              <>
                <RadarChart values={avgParams} size={240} />
                <p className="text-xs text-gray-400 mt-2">{totalReviews}件のレビューの平均</p>
              </>
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p className="text-sm">まだレビューがありません</p>
              </div>
            )}
          </div>
        </section>

        {/* Review timeline */}
        <section className="mb-8">
          <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#FFFF00] inline-block" />
            レビュー ({totalReviews})
          </h2>

          {reviewList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              <p className="text-sm">まだレビューがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewList.map((review) => {
                type UserField = { id: string; username: string; avatar_url: string | null } | null;
                const reviewUser: UserField = Array.isArray(review.users)
                  ? ((review.users[0] as UserField) ?? null)
                  : (review.users as UserField);

                const callItems = [
                  { label: "ヤサイ", value: review.call_yasai },
                  { label: "ニンニク", value: review.call_garlic },
                  { label: "アブラ", value: review.call_abura },
                  { label: "カラメ", value: review.call_karame },
                ].filter((c) => c.value && ["マシ", "マシマシ"].includes(c.value as string));

                return (
                  <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <Link href={`/reviews/${review.id}`} className="flex gap-2 mb-3 overflow-x-auto">
                        {(review.images as string[]).slice(0, 3).map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={url}
                            alt=""
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        ))}
                      </Link>
                    )}

                    {/* Rating */}
                    <Link href={`/reviews/${review.id}`} className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-4 h-4 ${n <= review.rating ? "fill-[#FFFF00] text-[#FFFF00]" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-black">{Number(review.rating).toFixed(1)}</span>
                    </Link>

                    {/* Calls */}
                    {callItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {callItems.map(({ label, value }) => (
                          <span key={label} className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFFF00] text-black border border-black">
                            {label}: {value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    {review.comment && (
                      <Link href={`/reviews/${review.id}`}>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2 hover:text-gray-900">{review.comment}</p>
                      </Link>
                    )}

                    {/* User + date */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                      {reviewUser ? (
                        <Link
                          href={`/users/${reviewUser.id}`}
                          className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                        >
                          {reviewUser.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={reviewUser.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                              {reviewUser.username[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-600">{reviewUser.username}</span>
                        </Link>
                      ) : (
                        <span>ユーザー</span>
                      )}
                      <span>{new Date(review.created_at).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
