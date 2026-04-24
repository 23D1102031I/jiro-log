-- condition_type制約を拡張
ALTER TABLE public.titles DROP CONSTRAINT IF EXISTS titles_condition_type_check;
ALTER TABLE public.titles ADD CONSTRAINT titles_condition_type_check
  CHECK (condition_type IN ('count', 'area', 'all', 'call', 'parameter', 'special'));

-- 既存の称号データを削除して再投入
DELETE FROM public.titles;

-- 称号マスタデータ（全28種類）
INSERT INTO public.titles (name, description, condition_type, condition_value) VALUES
  -- 累計実食数系
  ('初陣（ういじん）', '記念すべき最初の1杯を記録した', 'count', '{"min": 1}'),
  ('助手見習い', '累計10杯を記録した', 'count', '{"min": 10}'),
  ('ジロリアン・ビギナー', '累計30杯を記録した', 'count', '{"min": 30}'),
  ('ジロリアン・セミプロ', '累計50杯を記録した', 'count', '{"min": 50}'),
  ('ジロリアン・プロ', '累計100杯を記録した', 'count', '{"min": 100}'),
  ('ジロリアン・マスター', '累計300杯を記録した', 'count', '{"min": 300}'),
  ('ジロリアン・レジェンド', '累計500杯を記録した', 'count', '{"min": 500}'),
  ('殿堂入りジロリアン', '累計1000杯を記録した', 'count', '{"min": 1000}'),
  -- 店舗制覇系
  ('はじめての遠征', '3つの異なる店舗を訪問した', 'area', '{"type": "store_count", "min": 3}'),
  ('23区の覇王', '東京23区内の直系店舗をすべて制覇した', 'area', '{"region": "23区", "type": "all"}'),
  ('多摩の主', '多摩エリアの店舗を全制覇した', 'area', '{"region": "多摩", "type": "all"}'),
  ('神奈川支部長', '神奈川エリアの店舗を全制覇した', 'area', '{"region": "神奈川", "type": "all"}'),
  ('新幹線トラベラー', '関東以外の店舗を3店舗以上訪問した', 'area', '{"type": "outside_kanto", "min": 3}'),
  ('聖地巡礼', '三田本店でレビューを投稿した', 'area', '{"type": "specific_store", "store_name": "ラーメン二郎 三田本店"}'),
  ('直系マスター', '現在営業している直系全店を制覇した', 'all', '{}'),
  -- コール系
  ('野菜タワー建設業者', 'ヤサイでマシ以上を累計20回記録した', 'call', '{"call": "yasai", "min_level": "マシ", "count": 20}'),
  ('公害口臭', 'ニンニクでマシ以上を累計20回記録した', 'call', '{"call": "garlic", "min_level": "マシ", "count": 20}'),
  ('アブラは飲み物', 'アブラでマシ以上を累計20回記録した', 'call', '{"call": "abura", "min_level": "マシ", "count": 20}'),
  ('血糖値爆上げ', 'カラメでマシ以上を累計20回記録した', 'call', '{"call": "karame", "min_level": "マシ", "count": 20}'),
  ('神豚ハンター', '神豚度★5を10回記録した', 'parameter', '{"param": "pork_score", "value": 5, "count": 10}'),
  ('非乳化の求道者', '20回以上記録し乳化度の平均が2以下', 'parameter', '{"param": "emulsification_score", "avg_max": 2.0, "min_reviews": 20}'),
  ('ド乳化ジャンキー', '20回以上記録し乳化度の平均が4.5以上', 'parameter', '{"param": "emulsification_score", "avg_min": 4.5, "min_reviews": 20}'),
  ('飲める麺（デロ麺愛好家）', '20回以上記録し麺のデロさの平均が4.5以上', 'parameter', '{"param": "dero_score", "avg_min": 4.5, "min_reviews": 20}'),
  ('バキバキ主義者', '20回以上記録し麺のデロさの平均が1.5以下', 'parameter', '{"param": "dero_score", "avg_max": 1.5, "min_reviews": 20}'),
  -- 特殊・隠し系
  ('昼夜連食の鬼', '同じ日の昼と夜にレビューを投稿した', 'special', '{"type": "same_day_lunch_dinner"}'),
  ('はしご二郎', '同じ日に2店舗でレビューを投稿した', 'special', '{"type": "hashigo", "count": 2}'),
  ('毎日二郎', '3日連続でレビューを投稿した', 'special', '{"type": "consecutive_days", "count": 3}'),
  ('真冬の並び耐性', '1月または2月に5回以上レビューを投稿した', 'special', '{"type": "seasonal", "months": [1, 2], "count": 5}');

-- 店舗データ（全45店舗）
INSERT INTO public.stores (name, address, lat, lng, region, business_hours, closed_days, tags, sns_url) VALUES
  ('ラーメン二郎 三田本店', '東京都港区三田2-16-4', 35.6452, 139.741, '23区', '{"lunch": {"open": "08:00", "close": "20:00"}}'::jsonb, '日曜・祝日', '["直系本店", "朝営業あり"]'::jsonb, NULL),
  ('ラーメン二郎 目黒店', '東京都目黒区目黒3-7-2', 35.6312, 139.7027, '23区', '{"lunch": {"open": "11:00", "close": "16:00"}, "dinner": {"open": "18:00", "close": "23:00"}}'::jsonb, '不定休', '[]'::jsonb, 'https://x.com/zmakesrevo'),
  ('ラーメン二郎 仙川店', '東京都調布市仙川町1-10-17', 35.6598, 139.5798, '多摩', '{"dinner": {"open": "17:00", "close": "21:00"}}'::jsonb, '日曜・祝日', '[]'::jsonb, 'https://x.com/senjiro26'),
  ('ラーメン二郎 新宿歌舞伎町店', '東京都新宿区歌舞伎町2-37-5 日新ビル1F', 35.6952, 139.7036, '23区', '{"lunch": {"open": "11:30", "close": "02:30"}}'::jsonb, '水曜日', '["深夜営業"]'::jsonb, 'https://x.com/kabujiikeji'),
  ('ラーメン二郎 品川店', '東京都品川区北品川1-18-5', 35.622, 139.7385, '23区', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "21:00"}}'::jsonb, '日曜・祝日', '[]'::jsonb, 'https://x.com/shinagawa26'),
  ('ラーメン二郎 新宿小滝橋通り店', '東京都新宿区西新宿7-5-5', 35.696328, 139.69834, '23区', '{"lunch": {"open": "11:00", "close": "22:00"}}'::jsonb, '不定休', '[]'::jsonb, NULL),
  ('ラーメン二郎 環七新代田店', '東京都世田谷区代田5-29-5 櫻井ビル1F', 35.661, 139.6642, '23区', '{"lunch": {"open": "11:00", "close": "15:00"}}'::jsonb, '月曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/26shinshindaita'),
  ('ラーメン二郎 八王子野猿街道店2', '東京都八王子市堀之内2-13-16', 35.598, 139.3892, '多摩', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "21:00"}}'::jsonb, '月曜・月祝', '[]'::jsonb, 'https://x.com/jiro_yaenkaido2'),
  ('ラーメン二郎 池袋東口店', '東京都豊島区南池袋2-27-17 1F', 35.7308, 139.7184, '23区', '{"lunch": {"open": "11:00", "close": "15:30"}}'::jsonb, '火曜日', '[]'::jsonb, 'https://x.com/ikejikabuji'),
  ('ラーメン二郎 亀戸店', '東京都江東区亀戸4-35-17', 35.698, 139.8402, '23区', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:00", "close": "21:00"}}'::jsonb, '不定休', '[]'::jsonb, 'https://x.com/jiro_kame'),
  ('ラーメン二郎 府中店', '東京都府中市宮西町1-15-5', 35.6709, 139.4784, '多摩', '{"dinner": {"open": "17:00", "close": "22:00"}}'::jsonb, '土曜・日曜・祝日', '["動画撮影禁止"]'::jsonb, 'https://x.com/jiro_fuchu'),
  ('ラーメン二郎 めじろ台店', '東京都八王子市椚田町513-9', 35.6502, 139.3675, '多摩', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "20:30"}}'::jsonb, '木曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/mejirodai_jiro'),
  ('ラーメン二郎 荻窪店', '東京都杉並区荻窪4-33-1', 35.7052, 139.6194, '23区', '{"lunch": {"open": "11:30", "close": "14:15"}, "dinner": {"open": "18:00", "close": "21:30"}}'::jsonb, '日曜日', '[]'::jsonb, 'https://x.com/ogkb_jiro'),
  ('ラーメン二郎 上野毛店', '東京都世田谷区上野毛1-26-16', 35.6186, 139.6357, '23区', '{"lunch": {"open": "11:00", "close": "14:15"}, "dinner": {"open": "18:00", "close": "22:00"}}'::jsonb, '日曜・祝日', '[]'::jsonb, 'https://x.com/kaminogejiro'),
  ('ラーメン二郎 環七一之江店', '東京都江戸川区一之江8-3-4', 35.6926, 139.8743, '23区', '{"lunch": {"open": "10:30", "close": "14:00"}}'::jsonb, '水曜日', '["テイクアウトあり"]'::jsonb, 'https://x.com/ichinoejiro'),
  ('ラーメン二郎 神田神保町店', '東京都千代田区神田神保町1-21-4', 35.6961, 139.7577, '23区', '{"lunch": {"open": "11:00", "close": "17:30"}}'::jsonb, '日曜・祝日', '[]'::jsonb, 'https://x.com/jbc_jimbolian'),
  ('ラーメン二郎 小岩店', '東京都江戸川区西小岩3-31-13', 35.7296, 139.8821, '23区', '{"lunch": {"open": "10:30", "close": "15:00"}}'::jsonb, '月曜・日曜・祝日', '["テイクアウトあり"]'::jsonb, 'https://x.com/koiwajiro'),
  ('ラーメン二郎 ひばりヶ丘駅前店', '東京都西東京市谷戸町3-27-24', 35.7432, 139.5401, '多摩', '{"lunch": {"open": "11:30", "close": "14:30"}, "dinner": {"open": "18:00", "close": "21:00"}}'::jsonb, '日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/aarf0xvdbxkwd7o'),
  ('ラーメン二郎 立川店', '東京都立川市柴崎町2-10-1', 35.697, 139.4069, '多摩', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "20:30"}}'::jsonb, '水曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/jirotachikawa'),
  ('ラーメン二郎 千住大橋駅前店', '東京都足立区千住橋戸町10-8', 35.7402, 139.8035, '23区', '{"lunch": {"open": "10:30", "close": "15:30"}}'::jsonb, '木曜・日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/senjujirou26'),
  ('ラーメン二郎 西台駅前店', '東京都板橋区蓮根3-9-7', 35.7728, 139.6742, '23区', '{"lunch": {"open": "11:00", "close": "13:30"}, "dinner": {"open": "17:30", "close": "20:30"}}'::jsonb, '日曜・祝日', '[]'::jsonb, 'https://x.com/jiro_nishidai'),
  ('ラーメン二郎 一橋学園店', '東京都小平市学園西町2-13-4', 35.7188, 139.4748, '多摩', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "17:30", "close": "20:30"}}'::jsonb, '木曜日', '[]'::jsonb, 'https://x.com/1284jiro'),
  ('ラーメン二郎 京急川崎店', '神奈川県川崎市川崎区本町2-10', 35.5287, 139.7036, '神奈川', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "18:00", "close": "22:00"}}'::jsonb, '日曜・祝日', '[]'::jsonb, 'https://x.com/jiro_kwsk_bot'),
  ('ラーメン二郎 相模大野店', '神奈川県相模原市南区相模大野6-14-9', 35.5461, 139.439, '神奈川', '{"lunch": {"open": "10:20", "close": "14:00"}, "dinner": {"open": "17:00", "close": "20:30"}}'::jsonb, '月曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/sumo_jiro'),
  ('ラーメン二郎 横浜関内店', '神奈川県横浜市中区長者町6-94', 35.4442, 139.6335, '神奈川', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "22:00"}}'::jsonb, '水曜日', '[]'::jsonb, 'https://x.com/kannaijiro'),
  ('ラーメン二郎 湘南藤沢店', '神奈川県藤沢市本町1-10-14', 35.332, 139.4843, '神奈川', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:00", "close": "21:00"}}'::jsonb, '火曜日', '[]'::jsonb, 'https://x.com/fujirow26'),
  ('ラーメン二郎 中山駅前店', '神奈川県横浜市緑区台村町309-1', 35.5185, 139.5442, '神奈川', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "18:00", "close": "21:30"}}'::jsonb, '木曜日', '[]'::jsonb, 'https://x.com/nkymjiro'),
  ('ラーメン二郎 生田駅前店', '神奈川県川崎市多摩区生田8-1-15', 35.6122, 139.5188, '神奈川', '{"lunch": {"open": "11:00", "close": "15:00"}, "dinner": {"open": "18:00", "close": "21:00"}}'::jsonb, '水曜・祝日', '[]'::jsonb, 'https://x.com/ikuta_jiro'),
  ('ラーメン二郎 川越店', '埼玉県川越市旭町1-4-15', 35.9253, 139.4852, '埼玉', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "18:00", "close": "21:00"}}'::jsonb, '月曜日', '[]'::jsonb, 'https://x.com/kwge26'),
  ('ラーメン二郎 越谷店', '埼玉県越谷市越ヶ谷2-3-7', 35.8874, 139.7896, '埼玉', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:00", "close": "20:30"}}'::jsonb, '土曜・日曜（不定休）', '[]'::jsonb, 'https://x.com/ksgy26'),
  ('ラーメン二郎 大宮公園駅前店', '埼玉県さいたま市大宮区寿能町1-24 前場ビル1F', 35.9238, 139.6312, '埼玉', '{"lunch": {"open": "11:30", "close": "14:30"}, "dinner": {"open": "17:30", "close": "21:00"}}'::jsonb, '水曜日', '[]'::jsonb, 'https://x.com/omiyapark26'),
  ('ラーメン二郎 松戸駅前店Ⅲ', '千葉県松戸市本町17-21', 35.7846, 139.9017, '千葉', '{"dinner": {"open": "17:30", "close": "21:30"}}'::jsonb, '日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/matsudojiro3'),
  ('ラーメン二郎 京成大久保店', '千葉県船橋市三山2-1-11', 35.7138, 140.0228, '千葉', '{"lunch": {"open": "11:00", "close": "15:00"}}'::jsonb, '火・木・日・祝日', '[]'::jsonb, NULL),
  ('ラーメン二郎 柏店', '千葉県柏市十余二249-5 MEM柏1F', 35.8568, 139.9812, '千葉', '{"lunch": {"open": "10:30", "close": "16:00"}}'::jsonb, '日曜日', '[]'::jsonb, 'https://x.com/genkimoriya'),
  ('ラーメン二郎 千葉店', '千葉県千葉市中央区中央1-7-8', 35.6053, 140.1218, '千葉', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "21:30"}}'::jsonb, '日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/jiro_chiba'),
  ('ラーメン二郎 栃木街道店', '栃木県下都賀郡壬生町本丸2-15-67', 36.3996, 139.7962, 'その他', '{"lunch": {"open": "11:30", "close": "14:45"}, "dinner": {"open": "18:00", "close": "21:00"}}'::jsonb, '日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/tochigikaidoten'),
  ('ラーメン二郎 ひたちなか店', '茨城県ひたちなか市田彦1648-4', 36.3641, 140.5312, 'その他', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:30", "close": "21:00"}}'::jsonb, '日曜（連休時は変更あり）', '[]'::jsonb, 'https://x.com/26_hitachinaka'),
  ('ラーメン二郎 前橋千代田町店', '群馬県前橋市千代田町4-12-3', 36.3898, 139.0631, 'その他', '{"lunch": {"open": "10:30", "close": "14:30"}, "dinner": {"open": "17:00", "close": "20:00"}}'::jsonb, '月曜日', '[]'::jsonb, 'https://x.com/snbzt6ercdz7lqw'),
  ('ラーメン二郎 名古屋大曽根店', '愛知県名古屋市東区矢田4-3-7', 35.1755, 136.9371, 'その他', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "17:00", "close": "21:00"}}'::jsonb, '日曜日', '[]'::jsonb, 'https://x.com/jiro_NGY'),
  ('ラーメン二郎 京都店', '京都府京都市左京区一乗寺里ノ前町4', 35.0423, 135.7892, '関西', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "18:00", "close": "21:30"}}'::jsonb, '水曜・不定休', '[]'::jsonb, 'https://x.com/jiro_kyoto'),
  ('ラーメン二郎 札幌店', '北海道札幌市北区北6条西8丁目8-11', 43.0708, 141.3456, '北海道', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "17:00", "close": "20:30"}}'::jsonb, '日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/jiro_sapporo_'),
  ('ラーメン二郎 仙台店2', '宮城県仙台市青葉区一番町2-5-32 第一観光ビル1F', 38.2614, 140.8764, '東北', '{"lunch": {"open": "11:00", "close": "14:30"}, "dinner": {"open": "17:00", "close": "21:00"}}'::jsonb, '原則無休', '[]'::jsonb, 'https://x.com/jiro_sendai1023'),
  ('ラーメン二郎 会津若松駅前店', '福島県会津若松市駅前町6-31', 37.4944, 139.9282, '東北', '{"lunch": {"open": "11:00", "close": "14:00"}, "dinner": {"open": "17:00", "close": "21:00"}}'::jsonb, '月・第1第3第5日曜・祝日', '[]'::jsonb, 'https://x.com/aizu_jiro'),
  ('ラーメン二郎 新潟店', '新潟県新潟市中央区万代5-2-8', 37.92, 139.055, 'その他', '{"lunch": {"open": "10:45", "close": "13:45"}, "dinner": {"open": "16:30", "close": "21:00"}}'::jsonb, '月曜・木曜', '[]'::jsonb, 'https://www.instagram.com/jiro.niigata/'),
  ('ラーメン二郎 朝倉街道駅前店', '福岡県筑紫野市針摺中央2-17-8', 33.4752, 130.4886, '九州', '{"lunch": {"open": "11:30", "close": "14:30"}, "dinner": {"open": "18:00", "close": "21:00"}}'::jsonb, '土曜・日曜・祝日（不定休）', '[]'::jsonb, 'https://x.com/r26akgd');

-- いいねテーブル追加
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);
