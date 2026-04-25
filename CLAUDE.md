@AGENTS.md

# Jiro Log 開発ガイド

## プロジェクト概要
ラーメン二郎直系専用レビュー＆スタンプラリーアプリ。
仕様書: `設計/ラーメン二郎直系専用アプリ「Jiro Log」要件定義・仕様書.txt`
スプリント計画: `設計/SPRINTS.md`

## 技術スタック
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth/DB/Storage)
- React Leaflet (OpenStreetMap)
- Lucide React
- Playwright MCP (Evaluator用)

## 環境変数
`.env.local` に以下が設定済み:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabaseクライアント
- ブラウザ用: `src/lib/supabase/client.ts`
- サーバー用: `src/lib/supabase/server.ts`

---

## Generator（実装エージェント）プロトコル

スプリントを1つ担当し、以下の手順で進める:

1. **仕様確認**: `設計/SPRINTS.md` で該当スプリントの合格基準を確認
2. **実装**: フロントエンドUIは必ず `/frontend-design` スキルを使用
3. **ビルド確認**: `npm run build` が通ることを確認
4. **自己評価**: 合格基準を1つずつチェックし、結果をレポートとして出力
5. **引き渡し**: 自己評価レポートをEvaluatorに渡す

### 実装ルール
- UIコンポーネントは必ず `/frontend-design` スキルで生成
- カラー: ベース白 `#FFFFFF`, アクセント黄 `#FFFF00`, テキスト黒 `#000000`
- ゲスト閲覧可・投稿はログイン必須
- フッターに免責事項を必ず表示
- NGワードフィルターは全テキスト入力に適用

---

## Evaluator（評価エージェント）プロトコル

GeneratorのPRを受け取り、Playwright MCPを使って以下を実施:

1. **開発サーバー起動確認**: `http://localhost:3000` が応答するか確認
2. **合格基準テスト**: `設計/SPRINTS.md` の各チェック項目をPlaywrightで検証
3. **評価レポート出力**:
   ```
   スプリント: S0X
   結果: 合格 / 不合格
   合格項目: X/Y
   不合格項目と詳細:
   - [ ] ○○が動作しない: [スクリーンショット or エラー詳細]
   改善提案:
   - ...
   ```
4. **判定**: 全項目合格 → スプリント完了。1つでも不合格 → Generatorへフィードバック

### 評価の閾値
- **ビルドエラー**: 0件（必須）
- **合格基準**: 全項目クリア（1つでも不合格でスプリント不合格）
- **レスポンシブ**: モバイル375px・PC1280pxで崩れなし
- **ロード時間**: 初回表示3秒以内（目安）
