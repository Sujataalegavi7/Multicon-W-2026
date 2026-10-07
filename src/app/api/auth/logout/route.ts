import { clearAuthCookie } from "@/lib/auth";
import { handle, json } from "@/lib/http";

export const POST = handle(async () => {
  await clearAuthCookie();
  return json({ ok: true });
});
