import "server-only";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Verifikasi token Cloudflare Turnstile di server. Token berlaku 5 menit dan hanya sekali pakai. */
export async function verifyTurnstile(token: string, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY belum diisi");

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Turnstile siteverify membalas status ${response.status}`);

  const result: { success: boolean; "error-codes"?: string[] } = await response.json();
  if (!result.success) {
    console.warn("Turnstile menolak token:", result["error-codes"]);
  }
  return result.success === true;
}
