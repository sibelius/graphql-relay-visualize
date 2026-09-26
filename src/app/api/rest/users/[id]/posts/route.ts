import { latencyFrom, postsByUser, sleep } from "@/server/data";
import { restPost } from "@/server/rest";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sleep(latencyFrom(req, 150));
  return Response.json(postsByUser(id).map(restPost));
}
