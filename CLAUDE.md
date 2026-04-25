@AGENTS.md

# Jiro Log 開発ガイド

## プロジェクト概要
ラーメン二郎直系専用レビュー＆スタンプラリーWebアプリ。
- 仕様書: `設計/ラーメン二郎直系専用アプリ「Jiro Log」要件定義・仕様書.txt`
- 画面遷移: `設計/Jiro Log 画面遷移仕様書.txt`
- 称号: `設計/二郎称号仕様書.txt`
- スプリント: `設計/SPRINTS.md`
- デザイン参照: `二郎サイト素材/LP画像/`（**実装の最優先デザイン基準**）

## 技術スタック
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth / DB / Storage)
- React Leaflet (OpenStreetMap)
- Lucide React + motion

## 環境
- Supabaseクライアント: `src/lib/supabase/client.ts` / `src/lib/supabase/server.ts`
- 環境変数: `.env.local` 設定済み
- 開発サーバー: `npm run dev` → `http://localhost:3000`

---

## スプリント開発フロー

ユーザーが「S0Xを実装して」と指示したら以下のループを実行する：

```
1. Agent(generator) → S0Xを実装・自己評価レポートを出力
         ↓
2. Agent(evaluator) → Playwright MCPでテスト・合否判定
         ↓
   ✅ 合格 → SPRINTS.mdを更新 → 次のスプリントへ
   ❌ 不合格 → フィードバックをGeneratorへ渡す
         ↓
3. Agent(generator) → フィードバックを受けて修正
         ↓
4. Agent(evaluator) → 再テスト → 合格するまで繰り返す
```

## エージェント定義
- Generator: `.claude/agents/generator.md`
- Evaluator: `.claude/agents/evaluator.md`

---

## デザイン原則（全エージェント共通）

| 要素 | 値 |
|------|-----|
| ベース | `#FFFFFF` |
| アクセント | `#FFFF00`（電気イエロー） |
| テキスト | `#000000` / `#333333` |
| ロゴ | Bebas Neue |
| 本文 | Noto Sans JP |
| カード | `rounded-xl shadow-md border border-gray-100` |
| CTAボタン | `bg-[#FFFF00] text-black font-bold` |

**LP画像（`二郎サイト素材/LP画像/`）が最優先の設計基準。**

---

## セキュリティルール
- ゲスト: 閲覧のみ可。投稿・いいね・マイページはログイン必須
- `/admin`: 管理者ロールのみアクセス可
- RLS: Supabaseで設定済み（マイグレーション参照）
- フッター免責事項: **必ず全ページに表示**
  > 「当サイトは非公式ファンサイトであり、株式会社ラーメン二郎とは一切関係ありません」
