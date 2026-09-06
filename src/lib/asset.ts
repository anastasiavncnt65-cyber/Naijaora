/** Prefix public assets with Vite base (needed on GitHub Pages). */
export function asset(path: string): string {
  const clean = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}
