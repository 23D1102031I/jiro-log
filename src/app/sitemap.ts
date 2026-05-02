import type { MetadataRoute } from "next";
import { createBrowserClient } from "@supabase/ssr";

function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jiro-log-tau.vercel.app";

  const supabase = createSupabaseClient();

  const [{ data: stores }, { data: reviews }, { data: users }] =
    await Promise.all([
      supabase.from("stores").select("id, created_at"),
      supabase.from("reviews").select("id, created_at"),
      supabase.from("users").select("id, created_at"),
    ]);

  const storeUrls: MetadataRoute.Sitemap = (stores ?? []).map((store) => ({
    url: `${siteUrl}/stores/${store.id}`,
    lastModified: store.created_at ? new Date(store.created_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const reviewUrls: MetadataRoute.Sitemap = (reviews ?? []).map((review) => ({
    url: `${siteUrl}/reviews/${review.id}`,
    lastModified: review.created_at ? new Date(review.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const userUrls: MetadataRoute.Sitemap = (users ?? []).map((user) => ({
    url: `${siteUrl}/users/${user.id}`,
    lastModified: user.created_at ? new Date(user.created_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...storeUrls, ...reviewUrls, ...userUrls];
}
