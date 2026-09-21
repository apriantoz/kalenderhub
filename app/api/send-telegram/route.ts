import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, room, message, token: turnstileToken } = await req.json();

    // 1. Validasi keberadaan token Turnstile dari frontend
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Verifikasi keamanan (Turnstile) diperlukan." },
        { status: 400 }
      );
    }

    // 2. Verifikasi token ke server Cloudflare
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (secretKey) {
      const formData = new URLSearchParams();
      formData.append("secret", secretKey);
      formData.append("response", turnstileToken);

      const turnstileRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        }
      );

      const turnstileResult = await turnstileRes.json();

      if (!turnstileResult.success) {
        return NextResponse.json(
          { error: "Verifikasi bot gagal. Silakan coba lagi." },
          { status: 400 }
        );
      }
    }

    // 3. Cek Konfigurasi Bot Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Konfigurasi Telegram Bot belum lengkap di server." },
        { status: 500 }
      );
    }

    // 4. Format pesan ala Markdown Telegram
    const textPayload = 
      `🚨 *LAPORAN KENDALA LAB*\n\n` +
      `👤 *Pengirim:* ${name || "Anonim"}\n` +
      `📍 *Lab/Ruangan:* ${room || "Umum"}\n` +
      `💬 *Pesan:* ${message}\n\n` +
      `🕒 _Waktu: ${new Date().toLocaleString("id-ID")}_`;

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textPayload,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram Error:", errorData);
      return NextResponse.json({ error: "Gagal mengirim ke Telegram." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Pesan terkirim!" });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}