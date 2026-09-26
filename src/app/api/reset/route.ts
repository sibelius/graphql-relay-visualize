import { resetDB } from "@/server/data";

export async function POST() {
  resetDB();
  return Response.json({ ok: true });
}
