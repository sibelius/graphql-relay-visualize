import { getUser, latencyFrom, sleep } from "@/server/data";
import { restUser } from "@/server/rest";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sleep(latencyFrom(req, 150));
  const user = getUser(id);
  return user ? Response.json(restUser(user)) : Response.json({ error: "not found" }, { status: 404 });
}
