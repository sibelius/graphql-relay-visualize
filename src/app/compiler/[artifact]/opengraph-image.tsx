import { listArtifacts } from "@/server/artifacts";
import { ogAlt, OG_SIZE, renderOg } from "@/lib/og";

export const alt = ogAlt("/compiler");
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return listArtifacts().map((artifact) => ({ artifact }));
}

export default async function Image({ params }: { params: Promise<{ artifact: string }> }) {
  const { artifact } = await params;
  return renderOg("/compiler", artifact);
}
