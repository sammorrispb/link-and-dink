/**
 * Pull the http(s) hrefs out of an issue's *rendered* HTML. Operating on the
 * rendered HTML (not the raw markdown) means the stored URLs match exactly what
 * the click-rewrite in `renderEmail` will look for — including any entity
 * encoding `marked` applied. Stored in `issue_links` at enqueue time so the
 * click route can resolve a `linkId` to a known destination; no destination
 * ever travels as a URL param.
 */
export function extractLinks(html: string): string[] {
  const seen = new Set<string>();
  const re = /href="(https?:\/\/[^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    seen.add(match[1]);
  }
  return [...seen];
}
