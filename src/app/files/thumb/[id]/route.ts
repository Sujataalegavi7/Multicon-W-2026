import { NextRequest } from "next/server";
import { handle } from "@/lib/http";
import { authorizeFile, streamFromStorage } from "@/lib/serve-file";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return streamFromStorage(req, await authorizeFile(id, "thumb"));
});
