/** Google Drive file/folder id from any of its URL shapes; the same file with or without ?usp=sharing. */
export function driveId(u: string): string | null {
  const s = String(u);
  const m = s.match(/\/d\/([\w-]{10,})/) || s.match(/[?&]id=([\w-]{10,})/) || s.match(/\/folders\/([\w-]{10,})/);
  return m ? m[1] : null;
}
