"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !category || !message) {
    return { success: false, error: "すべての項目を入力してください" };
  }

  try {
    await resend.emails.send({
      from: "Jiro Log <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL!,
      subject: `【お問い合わせ】${category} - ${name}`,
      text: `名前: ${name}\nメール: ${email}\nカテゴリ: ${category}\n\n${message}`,
    });
    return { success: true };
  } catch {
    return { success: false, error: "送信に失敗しました。しばらく時間をおいて再度お試しください。" };
  }
}
