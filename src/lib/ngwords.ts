export const NG_WORDS = [
  "事故", "死亡", "骨折", "重傷", "殺害", "傷害", "暴力", "被害者", "放送事故",
  "ポルノ", "アダルト", "セックス", "バイブレーター", "マスターベーション",
  "オナニー", "スケベ", "羞恥", "セクロス", "エッチ", "SEX", "風俗", "童貞",
  "ペニス", "巨乳", "ロリ", "触手", "ノーブラ", "手ブラ", "ローアングル",
  "禁断", "Tバック", "グラビア", "美尻", "お尻", "セクシー", "無修正",
  "大麻", "麻薬", "基地外", "糞", "死ね", "殺す",
  "shit", "piss", "fuck", "cunt", "cocksucker", "motherfucker", "tits",
];

export function containsNGWord(text: string): boolean {
  const lower = text.toLowerCase();
  return NG_WORDS.some((w) => lower.includes(w.toLowerCase()));
}
