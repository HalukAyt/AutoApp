export function getSecureImageUrl(url: string): string;
export function getSecureImageUrl(url: null | undefined): undefined;
export function getSecureImageUrl(url: string | null | undefined) {
  if (!url) return undefined;
  return url.replace("http://", "https://");
}