"use client";

import { useState } from "react";
import { Plus, Edit2, Check, X, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

interface StoreRow {
  id: string;
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  closed_days: string | null;
  sns_url: string | null;
}

const EMPTY_FORM = {
  name: "", address: "", region: "23区",
  lat: "", lng: "", closed_days: "", sns_url: "",
};

const REGIONS = ["23区", "多摩", "神奈川", "千葉", "埼玉", "東北", "北海道", "関西", "九州", "その他"];

export function AdminStoreManager({ initialStores }: { initialStores: StoreRow[] }) {
  const { showToast } = useToast();
  const [stores, setStores] = useState(initialStores);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StoreRow>>({});
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.name || !form.address || !form.lat || !form.lng) {
      showToast("必須項目を入力してください", "error"); return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("stores").insert({
      name: form.name,
      address: form.address,
      region: form.region,
      lat: Number(form.lat),
      lng: Number(form.lng),
      closed_days: form.closed_days || null,
      sns_url: form.sns_url || null,
    }).select().single();
    setLoading(false);
    if (error) { showToast("追加に失敗しました: " + error.message, "error"); return; }
    setStores((prev) => [...prev, data]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
    showToast(`「${data.name}」を追加しました`, "success");
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("stores").update(editForm).eq("id", id);
    setLoading(false);
    if (error) { showToast("更新に失敗しました", "error"); return; }
    setStores((prev) => prev.map((s) => s.id === id ? { ...s, ...editForm } as StoreRow : s));
    setEditId(null);
    showToast("更新しました", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{stores.length}店舗登録中</p>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFFF00] text-black font-bold text-sm rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          店舗を追加
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-black text-gray-800 flex items-center gap-2">
            <Store className="w-4 h-4" /> 新規店舗追加
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "name", label: "店舗名 *", type: "text" },
              { key: "address", label: "住所 *", type: "text" },
              { key: "lat", label: "緯度 *", type: "number" },
              { key: "lng", label: "経度 *", type: "number" },
              { key: "closed_days", label: "定休日", type: "text" },
              { key: "sns_url", label: "SNS URL", type: "text" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">エリア *</label>
              <select
                value={form.region}
                onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFFF00]"
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="px-5 py-2 bg-black text-[#FFFF00] font-bold text-sm rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-[#FFFF00] border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              追加する
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Stores table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["店舗名", "住所", "エリア", "定休日", "操作"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                  {editId === store.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.name ?? store.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFFF00]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.address ?? store.address}
                          onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                          className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFFF00]"
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">{store.region}</td>
                      <td className="px-4 py-2">
                        <input
                          value={editForm.closed_days ?? store.closed_days ?? ""}
                          onChange={(e) => setEditForm((p) => ({ ...p, closed_days: e.target.value || null }))}
                          className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFFF00]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdate(store.id)}
                            disabled={loading}
                            className="p-1.5 bg-[#FFFF00] rounded text-black hover:bg-yellow-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 border rounded text-gray-500 hover:bg-gray-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{store.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{store.address}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{store.region}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{store.closed_days ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setEditId(store.id); setEditForm({}); }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
