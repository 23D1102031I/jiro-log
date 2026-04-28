# JIRO LOG — ジロリアンの記録帳

ラーメン二郎直系店舗専用のレビュー＆スタンプラリーWebアプリ。

🍜 **サイトURL**: [jiro-log-tau.vercel.app](https://jiro-log-tau.vercel.app)

---

## 基本情報

| 項目 | 内容 |
|------|------|
| 制作期間 | 2026/4/24〜2026/4/26（β版リリース）、2026/4/27〜改善中 |
| 開発人数 | 個人制作 |
| 使用ツール | Claude Code, Gemini Pro, ChatGPT Images 2.0, Supabase, Git, Vercel, Resend |
| ソースコード | [github.com/haruto2082/jiro-log](https://github.com/haruto2082/jiro-log) |

---

## 主な機能

### 記録・投稿
- レビュー投稿（評価・コール・パラメータ・画像）
- 訪問カレンダー

### 発見・探索
- 店舗マップ（OpenStreetMap）
- 店舗詳細・混雑時間帯チャート

### ゲーミフィケーション
- スタンプカード（店舗制覇）
- 称号システム（条件達成で自動付与・剥奪）

### ソーシャル
- タイムライン
- いいね
- ユーザープロフィール公開・シェア

### マイページ
- 実食数・制覇店舗・いいね数
- My Jiro Identity（レーダーチャート）
- レビュー履歴・店舗絞り込み

### その他
- Googleログイン
- お問い合わせフォーム

  <img width="781" height="2048" alt="ホーム画面" src="https://github.com/user-attachments/assets/b9fca847-b61b-43fd-a9f3-e1f7beb1f3fe" />

  <img width="1384" height="1182" alt="店舗マップ" src="https://github.com/user-attachments/assets/5e283ac7-8364-41ca-807d-9851e4034131" />

  <img width="864" height="1895" alt="スタンプラリー画面" src="https://github.com/user-attachments/assets/28bdefff-db05-4c6e-903d-04f4cfdf26a5" />

  <img width="1066" height="1536" alt="投稿画面" src="https://github.com/user-attachments/assets/a86eb4d0-5699-4916-b1b3-c2fc72ae5209" />

  <img width="1104" height="1482" alt="マイページ" src="https://github.com/user-attachments/assets/7bdb445f-ca0d-412f-a353-3cc467861c96" />

---

## 開発動機

私自身が二郎ラーメンが大好きで、二郎好きな友人同士でたまにレビューしているため、二郎に特化したレビュー（ニンニク・野菜など）を投稿できるサイトがあれば面白いと思ったことがきっかけです。

また、Claude Codeを最近触り始め、AI開発についてのZennやYouTubeをたくさん見る中で、Webサイトの作り方や開発の進め方、ChatGPT Images 2.0などの情報を知り、実際に開発してみたくなりました。

---

## アピールポイント

### AI駆動開発フロー

効率よく高品質な実装を実現するために、2つのサブエージェントを設計しました。

**Generator エージェント**
仕様書・スプリント管理ファイル・LP画像に基づいて実装と自己評価を行うエージェント。ビルドエラーの自己修正・合格基準チェックリストの確認・Evaluatorへの申し送りレポートを出力します。

**Evaluator エージェント**
Playwright MCPを使ったUI評価エージェント。Generatorの自己評価レポートを受け取り、実際にブラウザを操作してスプリントの合格基準を検証し、合否判定とフィードバックを出力します。

この2つをループさせることで、品質を担保しながら開発を効率よく進めました。

<img width="1672" height="941" alt="ChatGPT Image 2026年4月27日 19_46_42" src="https://github.com/user-attachments/assets/a91512d7-3487-4214-929a-da2a8b9aabcd" />

### 仕様策定のAI活用

仕様策定の際はGeminiに対して「私の考えをすべて引き出すよう質問・提案をする」よう指示し、コンサルティング形式の対話を通じて仕様を詰めました。これにより、当初想定していなかった機能（マップ・アカウント管理など）のアイデアも生まれました。

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フロントエンド | Next.js (App Router) / TypeScript / Tailwind CSS |
| バックエンド・DB | Supabase (Auth / PostgreSQL / Storage) |
| 地図 | React Leaflet / OpenStreetMap |
| メール送信 | Resend |
| デプロイ | Vercel |
| バージョン管理 | Git / GitHub |
| AI開発支援 | Claude Code / Gemini Pro / ChatGPT Images 2.0 |

---

## 免責事項

当サイトは非公式ファンサイトであり、有限会社ラーメン二郎とは一切関係ありません。
