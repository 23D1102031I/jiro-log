"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import type { User } from "@supabase/supabase-js";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      // Googleアカウントのアバターを初期値に
      const googleAvatar = data.user.user_metadata?.avatar_url ?? "";
      setAvatarUrl(googleAvatar);
    });
  }, [router]);

  const validateUsername = (value: string): string | null => {
    if (!value) return "ユーザー名を入力してください";
    if (value.length < 3) return "ユーザー名は3文字以上で入力してください";
    if (value.length > 30) return "ユーザー名は30文字以内で入力してください";
    if (!USERNAME_REGEX.test(value))
      return "ユーザー名は英数字とアンダースコアのみ使用できます";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // usersテーブルにupsert（RLSで本人のみ更新可）
    const { error: upsertError } = await supabase.from("users").upsert({
      id: user.id,
      username: username.trim(),
      avatar_url: avatarUrl,
    });

    if (upsertError) {
      // ユーザー名重複チェック
      if (upsertError.code === "23505") {
        setError("このユーザー名はすでに使用されています");
      } else {
        setError("プロフィールの保存に失敗しました。もう一度お試しください。");
      }
      setLoading(false);
      return;
    }

    showToast("プロフィールを設定しました！ようこそ、Jiro Logへ！", "success");
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1
          className="text-5xl tracking-wider"
          style={{
            fontFamily: "var(--font-bebas-neue), 'Bebas Neue', sans-serif",
          }}
        >
          <span className="text-black">Jiro </span>
          <span className="text-[#FFFF00] bg-black px-2">Log</span>
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black mb-1">
            プロフィール設定
          </h2>
          <p className="text-sm text-gray-500">
            Jiro Logで使うユーザー名を設定してください
          </p>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-6">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="アイコン"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#FFFF00]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-[#FFFF00] flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-black mb-1.5"
            >
              ユーザー名 <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="例: jiro_fan_tokyo"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent transition"
              maxLength={30}
              autoComplete="off"
            />
            <p className="text-xs text-gray-400 mt-1">
              英数字とアンダースコアのみ（3〜30文字）
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !username}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#FFFF00] text-black font-bold text-sm rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>保存中...</span>
              </>
            ) : (
              <span>✏️ Jiro Logを始める</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
