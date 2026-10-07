import { getSession } from "@/lib/auth";
import { HttpError, handle, json } from "@/lib/http";

export const GET = handle(async () => {
  const user = await getSession();
  if (!user) throw new HttpError(401, "Not authenticated");
  return json({ user });
});
