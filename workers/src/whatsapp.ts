// Thin wrapper around Meta Cloud API — no external deps needed
export async function sendWhatsAppText(
  to: string,
  body: string,
  apiToken: string,
  phoneNumberId: string,
): Promise<void> {
  if (!apiToken || !phoneNumberId) {
    console.log(`[WA] Not configured — skipping message to ${to}: ${body.slice(0, 60)}`);
    return;
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`[WA] Send failed to ${to}:`, err);
  } else {
    console.log(`[WA] Sent to ${to}: ${body.slice(0, 60)}`);
  }
}
