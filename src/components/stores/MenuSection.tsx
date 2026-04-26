"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Plus, Trash2, Check, X, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";

export type MenuItem = { name: string; price: number | null };
export type StoreMenu = { ramen: MenuItem[]; toppings: MenuItem[] };

interface Props {
  storeId: string;
  initialMenu: StoreMenu | null;
  isLoggedIn: boolean;
}

const EMPTY: StoreMenu = { ramen: [], toppings: [] };

function PriceText({ price }: { price: number | null }) {
  if (price === null || price === undefined) return <span className="text-gray-300 text-sm">—</span>;
  return (
    <span className="text-sm font-black tabular-nums">
      ¥{price.toLocaleString()}
    </span>
  );
}

export function MenuSection({ storeId, initialMenu, isLoggedIn }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState<StoreMenu>(initialMenu ?? EMPTY);
  const [draft, setDraft] = useState<StoreMenu>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(menu)));
    setEditing(true);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const updateItem = (
    section: "ramen" | "toppings",
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    setDraft((prev) => {
      const items = [...prev[section]];
      items[index] = {
        ...items[index],
        [field]: field === "price" ? (value === "" ? null : Number(value)) : value,
      };
      return { ...prev, [section]: items };
    });
  };

  const addItem = (section: "ramen" | "toppings") => {
    setDraft((prev) => ({
      ...prev,
      [section]: [...prev[section], { name: "", price: null }],
    }));
  };

  const removeItem = (section: "ramen" | "toppings", index: number) => {
    setDraft((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const allItems = [...draft.ramen, ...draft.toppings];
    if (allItems.some((item) => !item.name.trim())) {
      setError("商品名を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("ログインが必要です"); return; }

      const payload = {
        store_id: storeId,
        ramen: draft.ramen.filter((i) => i.name.trim()),
        toppings: draft.toppings.filter((i) => i.name.trim()),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };
      const { error: err } = await supabase.from("store_menus").upsert(payload);
      if (err) throw err;

      setMenu({ ramen: payload.ramen, toppings: payload.toppings });
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = menu.ramen.length === 0 && menu.toppings.length === 0;

  /* ── 表示モード ── */
  if (!editing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <span className="w-1 h-5 bg-[#FFFF00] rounded-full" />
            メニュー
          </h2>
          {isLoggedIn && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors"
            >
              <Pencil className="w-3 h-3" />
              編集
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="py-10 text-center">
            <UtensilsCrossed className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">メニュー情報はまだありません</p>
            {isLoggedIn && (
              <button
                onClick={startEdit}
                className="mt-3 inline-flex items-center gap-1.5 text-xs bg-black text-[#FFFF00] px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-3 h-3" />
                メニューを追加する
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* ラーメン */}
            {menu.ramen.length > 0 && (
              <div className="px-5 pt-4 pb-3">
                <p className="text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase mb-2.5">
                  ラーメン
                </p>
                <div className="space-y-0 divide-y divide-gray-50">
                  {menu.ramen.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-900">{item.name}</span>
                      <PriceText price={item.price} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* トッピング */}
            {menu.toppings.length > 0 && (
              <div className={`px-5 pt-4 pb-4 ${menu.ramen.length > 0 ? "border-t border-gray-100" : ""}`}>
                <p className="text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase mb-2.5">
                  トッピング
                </p>
                <div className="divide-y divide-gray-50">
                  {menu.toppings.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-900">{item.name}</span>
                      <PriceText price={item.price} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ── 編集モード ── */
  return (
    <div className="bg-white rounded-2xl border-2 border-[#FFFF00] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#FFFF00]/10 border-b border-[#FFFF00]/30">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Pencil className="w-3.5 h-3.5" />
          メニューを編集
        </h2>
        <button onClick={cancelEdit} className="text-gray-400 hover:text-black transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-6">
        {(["ramen", "toppings"] as const).map((section) => (
          <div key={section}>
            <p className="text-[10px] font-black tracking-[0.15em] text-gray-400 uppercase mb-2.5">
              {section === "ramen" ? "ラーメン" : "トッピング"}
            </p>
            <div className="space-y-2">
              {draft[section].map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(section, i, "name", e.target.value)}
                    placeholder={section === "ramen" ? "例: ラーメン" : "例: 豚増し"}
                    className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent"
                  />
                  <div className="relative w-28 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">¥</span>
                    <input
                      type="number"
                      value={item.price ?? ""}
                      onChange={(e) => updateItem(section, i, "price", e.target.value)}
                      placeholder="価格"
                      min="0"
                      className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#FFFF00] focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(section, i)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addItem(section)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {section === "ramen" ? "ラーメンを追加" : "トッピングを追加"}
              </button>
            </div>
          </div>
        ))}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            {saving ? "保存中..." : "保存する"}
          </button>
          <button
            onClick={cancelEdit}
            className="text-sm text-gray-400 hover:text-black transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
