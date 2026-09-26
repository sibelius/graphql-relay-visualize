import { commentsForPost, latencyFrom, sleep } from "@/server/data";
import { restComment } from "@/server/rest";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sleep(latencyFrom(req, 150));
  return Response.json(commentsForPost(id).map(restComment));
}
