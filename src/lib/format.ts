export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

/** Relay global IDs are base64("Type:id"); decode them for human labels. */
export function decodeId(id: string) {
  try {
    const decoded = atob(id);
    return /^[A-Z][A-Za-z]+:/.test(decoded) ? decoded : id;
  } catch {
    return id;
  }
}
