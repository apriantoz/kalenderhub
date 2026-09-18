import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, room, message } = await req.json();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Konfigurasi Telegram Bot belum lengkap di server." },
        { status: 500 }
      );
    }

    // Format pesan ala Markdown Telegram
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