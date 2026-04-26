import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const alt = "Jiro Log レビュー";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("rating, comment, images, stores(name)")
    .eq("id", id)
    .single();

  const storeName = review
    ? Array.isArray(review.stores)
      ? (review.stores[0] as { name: string })?.name
      : (review.stores as { name: string } | null)?.name
    : null;

  const rating = review?.rating ?? 0;
  const imageUrl = review?.images?.[0] ?? null;
  const stars = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#000",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image (blurred) */}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 80px",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              JIRO{" "}
              <span style={{ color: "#FFFF00", background: "#000", padding: "0 8px" }}>
                LOG
              </span>
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Store name */}
            <div
              style={{
                fontSize: "52px",
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.15,
                maxWidth: "900px",
              }}
            >
              {storeName ?? "ラーメン二郎"}
            </div>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  fontSize: "56px",
                  color: "#FFFF00",
                  letterSpacing: "4px",
                }}
              >
                {stars}
              </div>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 900,
                  color: "#000",
                  background: "#FFFF00",
                  padding: "4px 20px",
                  borderRadius: "12px",
                }}
              >
                {Number(rating).toFixed(1)}
              </div>
            </div>

            {/* Comment preview */}
            {review?.comment && (
              <div
                style={{
                  fontSize: "24px",
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: "800px",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {review.comment}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderTop: "2px solid #FFFF00",
              paddingTop: "20px",
            }}
          >
            <div style={{ color: "#FFFF00", fontSize: "18px", fontWeight: 700 }}>
              jiro-log.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
