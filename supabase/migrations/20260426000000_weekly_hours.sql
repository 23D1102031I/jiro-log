-- weekly_hours カラムを追加（曜日別営業時間）
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS weekly_hours jsonb;

-- ============================
-- 各店舗の weekly_hours を更新
-- フォーマット:
--   {"mon": {"open": "HH:MM", "close": "HH:MM"}, ...}
--   ランチ+ディナーは "dinner": {"open": ..., "close": ...} を追加
--   定休日は null
--   "irregular": true で不定休フラグ
-- ============================

-- 三田本店: 月〜土 08:00-20:00, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"08:00","close":"20:00"},
  "tue": {"open":"08:00","close":"20:00"},
  "wed": {"open":"08:00","close":"20:00"},
  "thu": {"open":"08:00","close":"20:00"},
  "fri": {"open":"08:00","close":"20:00"},
  "sat": {"open":"08:00","close":"20:00"},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 三田本店';

-- 目黒店: 毎日 11:00-16:00 / 18:00-23:00, 不定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "tue": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "wed": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "thu": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "fri": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "sat": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "sun": {"open":"11:00","close":"16:00","dinner":{"open":"18:00","close":"23:00"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 目黒店';

-- 仙川店: 月〜土 17:00-21:00（夜のみ）, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"17:00","close":"21:00"},
  "tue": {"open":"17:00","close":"21:00"},
  "wed": {"open":"17:00","close":"21:00"},
  "thu": {"open":"17:00","close":"21:00"},
  "fri": {"open":"17:00","close":"21:00"},
  "sat": {"open":"17:00","close":"21:00"},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 仙川店';

-- 新宿歌舞伎町店: 月・火・木〜日 11:30-翌02:30（深夜）, 水定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:30","close":"02:30"},
  "tue": {"open":"11:30","close":"02:30"},
  "wed": null,
  "thu": {"open":"11:30","close":"02:30"},
  "fri": {"open":"11:30","close":"02:30"},
  "sat": {"open":"11:30","close":"02:30"},
  "sun": {"open":"11:30","close":"02:30"},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 新宿歌舞伎町店';

-- 品川店: 月〜土 11:00-14:30 / 17:30-21:00, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 品川店';

-- 新宿小滝橋通り店: 11:00-22:00, 不定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"22:00"},
  "tue": {"open":"11:00","close":"22:00"},
  "wed": {"open":"11:00","close":"22:00"},
  "thu": {"open":"11:00","close":"22:00"},
  "fri": {"open":"11:00","close":"22:00"},
  "sat": {"open":"11:00","close":"22:00"},
  "sun": {"open":"11:00","close":"22:00"},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 新宿小滝橋通り店';

-- 環七新代田店: 月定休, 火〜日 11:00-15:00, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"11:00","close":"15:00"},
  "wed": {"open":"11:00","close":"15:00"},
  "thu": {"open":"11:00","close":"15:00"},
  "fri": {"open":"11:00","close":"15:00"},
  "sat": {"open":"11:00","close":"15:00"},
  "sun": {"open":"11:00","close":"15:00"},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 環七新代田店';

-- 八王子野猿街道店2: 月定休, 火〜日 11:00-14:30 / 17:30-21:00
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 八王子野猿街道店2';

-- 池袋東口店: 火定休, 他 11:00-15:30
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"15:30"},
  "tue": null,
  "wed": {"open":"11:00","close":"15:30"},
  "thu": {"open":"11:00","close":"15:30"},
  "fri": {"open":"11:00","close":"15:30"},
  "sat": {"open":"11:00","close":"15:30"},
  "sun": {"open":"11:00","close":"15:30"},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 池袋東口店';

-- 亀戸店: 毎日 11:00-14:30 / 17:00-21:00, 不定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 亀戸店';

-- 府中店: 月〜金 17:00-22:00（夜のみ）, 土・日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"17:00","close":"22:00"},
  "tue": {"open":"17:00","close":"22:00"},
  "wed": {"open":"17:00","close":"22:00"},
  "thu": {"open":"17:00","close":"22:00"},
  "fri": {"open":"17:00","close":"22:00"},
  "sat": null,
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 府中店';

-- めじろ台店: 木定休, 他 11:00-14:30 / 17:30-20:30, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "thu": null,
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 めじろ台店';

-- 荻窪店: 月〜土 11:30-14:15 / 18:00-21:30, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:30","close":"14:15","dinner":{"open":"18:00","close":"21:30"}},
  "tue": {"open":"11:30","close":"14:15","dinner":{"open":"18:00","close":"21:30"}},
  "wed": {"open":"11:30","close":"14:15","dinner":{"open":"18:00","close":"21:30"}},
  "thu": {"open":"11:30","close":"14:15","dinner":{"open":"18:00","close":"21:30"}},
  "fri": {"open":"11:30","close":"14:15","dinner":{"open":"18:00","close":"21:30"}},
  "sat": {"open":"11:30","close":"14:15","dinner":{"open":"18:00","close":"21:30"}},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 荻窪店';

-- 上野毛店: 月〜土 11:00-14:15 / 18:00-22:00, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:15","dinner":{"open":"18:00","close":"22:00"}},
  "tue": {"open":"11:00","close":"14:15","dinner":{"open":"18:00","close":"22:00"}},
  "wed": {"open":"11:00","close":"14:15","dinner":{"open":"18:00","close":"22:00"}},
  "thu": {"open":"11:00","close":"14:15","dinner":{"open":"18:00","close":"22:00"}},
  "fri": {"open":"11:00","close":"14:15","dinner":{"open":"18:00","close":"22:00"}},
  "sat": {"open":"11:00","close":"14:15","dinner":{"open":"18:00","close":"22:00"}},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 上野毛店';

-- 環七一之江店: 水定休, 他 10:30-14:00
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"10:30","close":"14:00"},
  "tue": {"open":"10:30","close":"14:00"},
  "wed": null,
  "thu": {"open":"10:30","close":"14:00"},
  "fri": {"open":"10:30","close":"14:00"},
  "sat": {"open":"10:30","close":"14:00"},
  "sun": {"open":"10:30","close":"14:00"},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 環七一之江店';

-- 神田神保町店: 月〜土 11:00-17:30, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"17:30"},
  "tue": {"open":"11:00","close":"17:30"},
  "wed": {"open":"11:00","close":"17:30"},
  "thu": {"open":"11:00","close":"17:30"},
  "fri": {"open":"11:00","close":"17:30"},
  "sat": {"open":"11:00","close":"17:30"},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 神田神保町店';

-- 小岩店: 月・日定休, 火〜土 10:30-15:00
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"10:30","close":"15:00"},
  "wed": {"open":"10:30","close":"15:00"},
  "thu": {"open":"10:30","close":"15:00"},
  "fri": {"open":"10:30","close":"15:00"},
  "sat": {"open":"10:30","close":"15:00"},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 小岩店';

-- ひばりヶ丘駅前店: 月〜土 11:30-14:30 / 18:00-21:00, 日定休（不定休あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "tue": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "wed": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "thu": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "fri": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "sat": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 ひばりヶ丘駅前店';

-- 立川店: 水定休, 他 11:00-14:30 / 17:30-20:30, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "wed": null,
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"20:30"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 立川店';

-- 千住大橋駅前店: 木・日定休, 月〜水・金〜土 10:30-15:30, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"10:30","close":"15:30"},
  "tue": {"open":"10:30","close":"15:30"},
  "wed": {"open":"10:30","close":"15:30"},
  "thu": null,
  "fri": {"open":"10:30","close":"15:30"},
  "sat": {"open":"10:30","close":"15:30"},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 千住大橋駅前店';

-- 西台駅前店: 月〜土 11:00-13:30 / 17:30-20:30, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"13:30","dinner":{"open":"17:30","close":"20:30"}},
  "tue": {"open":"11:00","close":"13:30","dinner":{"open":"17:30","close":"20:30"}},
  "wed": {"open":"11:00","close":"13:30","dinner":{"open":"17:30","close":"20:30"}},
  "thu": {"open":"11:00","close":"13:30","dinner":{"open":"17:30","close":"20:30"}},
  "fri": {"open":"11:00","close":"13:30","dinner":{"open":"17:30","close":"20:30"}},
  "sat": {"open":"11:00","close":"13:30","dinner":{"open":"17:30","close":"20:30"}},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 西台駅前店';

-- 一橋学園店: 木定休, 他 11:00-14:00 / 17:30-20:30
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:00","dinner":{"open":"17:30","close":"20:30"}},
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"17:30","close":"20:30"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"17:30","close":"20:30"}},
  "thu": null,
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"17:30","close":"20:30"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"17:30","close":"20:30"}},
  "sun": {"open":"11:00","close":"14:00","dinner":{"open":"17:30","close":"20:30"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 一橋学園店';

-- 京急川崎店: 月〜土 11:00-14:00 / 18:00-22:00, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"22:00"}},
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"22:00"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"22:00"}},
  "thu": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"22:00"}},
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"22:00"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"22:00"}},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 京急川崎店';

-- 相模大野店: 月定休, 火〜日 10:20-14:00 / 17:00-20:30, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"10:20","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "wed": {"open":"10:20","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "thu": {"open":"10:20","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "fri": {"open":"10:20","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "sat": {"open":"10:20","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "sun": {"open":"10:20","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 相模大野店';

-- 横浜関内店: 水定休, 他 11:00-14:30 / 17:30-22:00
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"22:00"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"22:00"}},
  "wed": null,
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"22:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"22:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"22:00"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"22:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 横浜関内店';

-- 湘南藤沢店: 火定休, 他 11:00-14:30 / 17:00-21:00
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "tue": null,
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 湘南藤沢店';

-- 中山駅前店: 木定休, 他 11:00-14:00 / 18:00-21:30
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "thu": null,
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "sun": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 中山駅前店';

-- 生田駅前店: 水定休, 他 11:00-15:00 / 18:00-21:00
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"15:00","dinner":{"open":"18:00","close":"21:00"}},
  "tue": {"open":"11:00","close":"15:00","dinner":{"open":"18:00","close":"21:00"}},
  "wed": null,
  "thu": {"open":"11:00","close":"15:00","dinner":{"open":"18:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"15:00","dinner":{"open":"18:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"15:00","dinner":{"open":"18:00","close":"21:00"}},
  "sun": {"open":"11:00","close":"15:00","dinner":{"open":"18:00","close":"21:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 生田駅前店';

-- 川越店: 月定休, 火〜日 11:00-14:00 / 18:00-21:00
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:00"}},
  "sun": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 川越店';

-- 越谷店: 土・日定休, 月〜金 11:00-14:30 / 17:00-20:30, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"20:30"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"20:30"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"20:30"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"20:30"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"20:30"}},
  "sat": null,
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 越谷店';

-- 大宮公園駅前店: 水定休, 他 11:30-14:30 / 17:30-21:00
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:30","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "tue": {"open":"11:30","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "wed": null,
  "thu": {"open":"11:30","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "fri": {"open":"11:30","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sat": {"open":"11:30","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sun": {"open":"11:30","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 大宮公園駅前店';

-- 松戸駅前店Ⅲ: 月〜土 17:30-21:30（夜のみ）, 日定休（不定休あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"17:30","close":"21:30"},
  "tue": {"open":"17:30","close":"21:30"},
  "wed": {"open":"17:30","close":"21:30"},
  "thu": {"open":"17:30","close":"21:30"},
  "fri": {"open":"17:30","close":"21:30"},
  "sat": {"open":"17:30","close":"21:30"},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 松戸駅前店Ⅲ';

-- 京成大久保店: 月・水・金・土 11:00-15:00, 火・木・日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"15:00"},
  "tue": null,
  "wed": {"open":"11:00","close":"15:00"},
  "thu": null,
  "fri": {"open":"11:00","close":"15:00"},
  "sat": {"open":"11:00","close":"15:00"},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 京成大久保店';

-- 柏店: 月〜土 10:30-16:00, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"10:30","close":"16:00"},
  "tue": {"open":"10:30","close":"16:00"},
  "wed": {"open":"10:30","close":"16:00"},
  "thu": {"open":"10:30","close":"16:00"},
  "fri": {"open":"10:30","close":"16:00"},
  "sat": {"open":"10:30","close":"16:00"},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 柏店';

-- 千葉店: 月〜土 11:00-14:30 / 17:30-21:30, 日定休（不定休あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:30"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:30"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:30"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:30"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:30"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:30"}},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 千葉店';

-- 栃木街道店: 月〜土 11:30-14:45 / 18:00-21:00, 日定休（不定休あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:30","close":"14:45","dinner":{"open":"18:00","close":"21:00"}},
  "tue": {"open":"11:30","close":"14:45","dinner":{"open":"18:00","close":"21:00"}},
  "wed": {"open":"11:30","close":"14:45","dinner":{"open":"18:00","close":"21:00"}},
  "thu": {"open":"11:30","close":"14:45","dinner":{"open":"18:00","close":"21:00"}},
  "fri": {"open":"11:30","close":"14:45","dinner":{"open":"18:00","close":"21:00"}},
  "sat": {"open":"11:30","close":"14:45","dinner":{"open":"18:00","close":"21:00"}},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 栃木街道店';

-- ひたちなか店: 月〜土 11:00-14:30 / 17:30-21:00, 日定休（連休時変更あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:30","close":"21:00"}},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 ひたちなか店';

-- 前橋千代田町店: 月定休, 火〜日 10:30-14:30 / 17:00-20:00
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"10:30","close":"14:30","dinner":{"open":"17:00","close":"20:00"}},
  "wed": {"open":"10:30","close":"14:30","dinner":{"open":"17:00","close":"20:00"}},
  "thu": {"open":"10:30","close":"14:30","dinner":{"open":"17:00","close":"20:00"}},
  "fri": {"open":"10:30","close":"14:30","dinner":{"open":"17:00","close":"20:00"}},
  "sat": {"open":"10:30","close":"14:30","dinner":{"open":"17:00","close":"20:00"}},
  "sun": {"open":"10:30","close":"14:30","dinner":{"open":"17:00","close":"20:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 前橋千代田町店';

-- 名古屋大曽根店: 月〜土 11:00-14:00 / 17:00-21:00, 日定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "sun": null,
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 名古屋大曽根店';

-- 京都店: 水定休, 他 11:00-14:00 / 18:00-21:30, 不定休あり
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "wed": null,
  "thu": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "sun": {"open":"11:00","close":"14:00","dinner":{"open":"18:00","close":"21:30"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 京都店';

-- 札幌店: 月〜土 11:00-14:00 / 17:00-20:30, 日定休（不定休あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "thu": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"20:30"}},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 札幌店';

-- 仙台店2: 原則無休, 毎日 11:00-14:30 / 17:00-21:00, 不定休
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "tue": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "sun": {"open":"11:00","close":"14:30","dinner":{"open":"17:00","close":"21:00"}},
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 仙台店2';

-- 会津若松駅前店: 月・日定休（第2・4日曜は営業）, 火〜土 11:00-14:00 / 17:00-21:00, 不定休
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "wed": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "thu": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "fri": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "sat": {"open":"11:00","close":"14:00","dinner":{"open":"17:00","close":"21:00"}},
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 会津若松駅前店';

-- 新潟店: 月・木定休, 火・水・金〜日 10:45-13:45 / 16:30-21:00
UPDATE public.stores SET weekly_hours = '{
  "mon": null,
  "tue": {"open":"10:45","close":"13:45","dinner":{"open":"16:30","close":"21:00"}},
  "wed": {"open":"10:45","close":"13:45","dinner":{"open":"16:30","close":"21:00"}},
  "thu": null,
  "fri": {"open":"10:45","close":"13:45","dinner":{"open":"16:30","close":"21:00"}},
  "sat": {"open":"10:45","close":"13:45","dinner":{"open":"16:30","close":"21:00"}},
  "sun": {"open":"10:45","close":"13:45","dinner":{"open":"16:30","close":"21:00"}},
  "irregular": false
}'::jsonb WHERE name = 'ラーメン二郎 新潟店';

-- 朝倉街道駅前店: 月〜金 11:30-14:30 / 18:00-21:00, 土・日定休（不定休あり）
UPDATE public.stores SET weekly_hours = '{
  "mon": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "tue": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "wed": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "thu": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "fri": {"open":"11:30","close":"14:30","dinner":{"open":"18:00","close":"21:00"}},
  "sat": null,
  "sun": null,
  "irregular": true
}'::jsonb WHERE name = 'ラーメン二郎 朝倉街道駅前店';
