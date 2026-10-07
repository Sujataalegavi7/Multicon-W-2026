import { handle, json } from "@/lib/http";
import { getFilterMeta } from "@/lib/papers";

export const dynamic = "force-dynamic";
export const GET = handle(async () => json(await getFilterMeta()));
